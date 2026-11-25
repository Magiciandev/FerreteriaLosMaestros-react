import { useEffect, useState } from "react";
import { Alert, Toast, ToastContainer } from "react-bootstrap";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import Cargando from "./components/Cargando";
import Footer from "./components/Footer";
import Header from "./components/Header";
import PanelAdmin from "./components/PanelAdmin";
import blogSemilla from "./data/blog.json";
import AccesoRestringido from "./pages/AccesoRestringido";
import AdminCategoriaForm from "./pages/admin/AdminCategoriaForm";
import AdminCategorias from "./pages/admin/AdminCategorias";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrdenDetalle from "./pages/admin/AdminOrdenDetalle";
import AdminOrdenes from "./pages/admin/AdminOrdenes";
import AdminProductoDetalle from "./pages/admin/AdminProductoDetalle";
import AdminProductoForm from "./pages/admin/AdminProductoForm";
import AdminProductos from "./pages/admin/AdminProductos";
import AdminProductosCriticos from "./pages/admin/AdminProductosCriticos";
import AdminReportes from "./pages/admin/AdminReportes";
import AdminUsuarioDetalle from "./pages/admin/AdminUsuarioDetalle";
import AdminUsuarioForm from "./pages/admin/AdminUsuarioForm";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import Blog from "./pages/Blog";
import Carrito from "./pages/Carrito";
import Categoria from "./pages/Categoria";
import Categorias from "./pages/Categorias";
import Checkout from "./pages/Checkout";
import Contacto from "./pages/Contacto";
import DetalleBlog from "./pages/DetalleBlog";
import DetalleProducto from "./pages/DetalleProducto";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import NoEncontrada from "./pages/NoEncontrada";
import Nosotros from "./pages/Nosotros";
import Ofertas from "./pages/Ofertas";
import Productos from "./pages/Productos";
import Registro from "./pages/Registro";
import * as authService from "./services/authService";
import * as categoriaService from "./services/categoriaService";
import { armarSolicitudOrden } from "./services/compras";
import * as consultaService from "./services/consultaService";
import * as ordenService from "./services/ordenService";
import * as productoService from "./services/productoService";
import * as usuarioService from "./services/usuarioService";
import { guardarJSON, leerJSON } from "./utils/almacenamiento";
import { agregarItem, cambiarCantidad, contarItems, detallarCarrito, quitarItem } from "./utils/carrito";

function App() {
  // Estado de la aplicación. Vive en App y baja a las páginas por props.
  // Catálogo (productos y categorías): se pide al servidor una vez, al abrir la tienda.
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  // Sesión: { correo, rol } o null. Viene de sessionStorage (la guarda authService al ingresar).
  const [sesion, setSesion] = useState(authService.obtenerSesion);
  // Datos del panel (órdenes y usuarios): solo se piden cuando hay una sesión del personal. El
  // administrador recibe ambos; el vendedor solo las órdenes.
  const [ordenes, setOrdenes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [panelCargado, setPanelCargado] = useState(false);
  const [errorPanel, setErrorPanel] = useState("");
  // carrito: arreglo de { idProducto, cantidad }. Se guarda en el navegador, no en el servidor.
  const [carrito, setCarrito] = useState(() => leerJSON("carrito", []));
  // Aviso (Toast) que aparece al agregar un producto al carrito y se desvanece solo. "texto" se
  // conserva mientras se desvanece; "id" cambia cuando se agrega otro producto con el aviso aún
  // visible, para que el Toast se vuelva a crear y su temporizador parta de cero.
  const [aviso, setAviso] = useState({ id: 0, texto: "", visible: false });

  const esAdmin = sesion?.rol === "ADMIN";
  const esVendedor = sesion?.rol === "VENDEDOR";

  useEffect(() => guardarJSON("carrito", carrito), [carrito]);

  useEffect(() => {
    async function cargarCatalogo() {
      try {
        const [listaProductos, listaCategorias] = await Promise.all([
          productoService.listarProductos(),
          categoriaService.listarCategorias(),
        ]);
        setProductos(listaProductos);
        setCategorias(listaCategorias);
      } catch (error) {
        setErrorCarga(error.message);
      } finally {
        setCargando(false);
      }
    }
    cargarCatalogo();
  }, []);

  useEffect(() => {
    if (!esAdmin && !esVendedor) return;
    async function cargarPanel() {
      try {
        // Al vendedor no se le piden los usuarios: el servidor se los negaría (403).
        const [listaOrdenes, listaUsuarios] = await Promise.all([
          ordenService.listarOrdenes(),
          esAdmin ? usuarioService.listarUsuarios() : Promise.resolve([]),
        ]);
        setOrdenes(listaOrdenes);
        setUsuarios(listaUsuarios);
      } catch (error) {
        setErrorPanel(error.message);
      } finally {
        setPanelCargado(true);
      }
    }
    cargarPanel();
  }, [esAdmin, esVendedor]);

  // ---- Sesión ----

  // Pide el inicio de sesión al servicio de autenticación y deja la sesión en el estado. Si las
  // credenciales son incorrectas, falla con el mensaje del servidor (lo muestra el Login).
  async function ingresar(correo, password) {
    const usuario = await authService.login(correo, password);
    setSesion(usuario);
    return usuario;
  }

  function salir() {
    authService.cerrarSesion();
    setSesion(null);
    setOrdenes([]);
    setUsuarios([]);
    setPanelCargado(false);
    setErrorPanel("");
  }

  // Las páginas del panel se dibujan dentro de PanelAdmin (menú lateral + contenido). El
  // administrador entra a todas; el vendedor solo a las marcadas con { vendedor: true } (lista y
  // detalle de productos y de órdenes). Con cualquier otra sesión se muestra el acceso restringido.
  function panel(pagina, { vendedor = false } = {}) {
    if (!esAdmin && !(esVendedor && vendedor)) return <AccesoRestringido />;
    if (!panelCargado) return <Cargando />;
    return (
      <PanelAdmin esAdmin={esAdmin}>
        {errorPanel && <Alert variant="danger">{errorPanel}</Alert>}
        {pagina}
      </PanelAdmin>
    );
  }

  // ---- Carrito ----

  // El carrito guarda solo { idProducto, cantidad }; para mostrarlo se reconstruye contra el
  // catálogo actual (precios con oferta, stock al día).
  const lineasCarrito = detallarCarrito(carrito, productos);

  function agregarAlCarrito(producto, cantidad = 1) {
    setCarrito((actual) => agregarItem(actual, producto.id, cantidad, producto.stock));
    setAviso((actual) => ({ id: actual.visible ? actual.id + 1 : actual.id, texto: `${producto.nombre} se agregó al carrito.`, visible: true }));
  }

  function cambiarCantidadCarrito(idProducto, cantidad) {
    const producto = productos.find((item) => item.id === idProducto);
    setCarrito((actual) => cambiarCantidad(actual, idProducto, cantidad, producto.stock));
  }

  function quitarDelCarrito(idProducto) {
    setCarrito((actual) => quitarItem(actual, idProducto));
  }

  // Registra el intento de compra en el servidor, que calcula los precios, revisa el stock y, si el
  // pago fue aprobado, lo descuenta. Si el pago se aprobó se vacía el carrito y se vuelve a pedir
  // el catálogo (el stock cambió); si fue rechazado el carrito se conserva para reintentar. Si el
  // servidor rechaza la compra (por ejemplo, sin stock) este método falla con su mensaje.
  async function confirmarCompra(datos, aprobado) {
    const orden = await ordenService.crearOrden(armarSolicitudOrden({ datos, lineas: lineasCarrito, aprobado }));
    if (orden.estado === "pagada") {
      setCarrito([]);
      setProductos(await productoService.listarProductos());
    }
    return orden;
  }

  // ---- Productos (el id es el código que escribe el administrador) ----

  async function crearProducto(producto) {
    const creado = await productoService.crearProducto(producto);
    setProductos((actual) => [...actual, creado]);
  }

  // El servidor reemplaza todos los campos, así que se envía el producto completo (el actual con los cambios).
  async function actualizarProducto(id, cambios) {
    const actual = productos.find((item) => item.id === id);
    const actualizado = await productoService.actualizarProducto(id, { ...actual, ...cambios });
    setProductos((lista) => lista.map((item) => (item.id === id ? actualizado : item)));
  }

  async function eliminarProducto(id) {
    await productoService.eliminarProducto(id);
    setProductos((lista) => lista.filter((item) => item.id !== id));
  }

  // ---- Categorías (el id es el slug) ----

  async function crearCategoria(categoria) {
    const creada = await categoriaService.crearCategoria(categoria);
    setCategorias((actual) => [...actual, creada]);
  }

  async function actualizarCategoria(slug, cambios) {
    const actualizada = await categoriaService.actualizarCategoria(slug, { slug, ...cambios });
    setCategorias((lista) => lista.map((item) => (item.slug === slug ? actualizada : item)));
  }

  async function eliminarCategoria(slug) {
    await categoriaService.eliminarCategoria(slug);
    setCategorias((lista) => lista.filter((item) => item.slug !== slug));
  }

  // ---- Usuarios (viven en el servicio de autenticación; el servidor asigna el id) ----

  async function crearUsuario(usuario) {
    const creado = await usuarioService.crearUsuario(usuario);
    setUsuarios((actual) => [...actual, creado]);
  }

  async function actualizarUsuario(id, cambios) {
    const actualizado = await usuarioService.actualizarUsuario(id, cambios);
    setUsuarios((lista) => lista.map((item) => (item.id === id ? actualizado : item)));
  }

  async function eliminarUsuario(id) {
    await usuarioService.eliminarUsuario(id);
    setUsuarios((lista) => lista.filter((item) => item.id !== id));
  }

  // Guarda el mensaje del formulario de contacto.
  async function enviarConsulta(datos) {
    await consultaService.crearConsulta(datos);
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <a className="salto-contenido" href="#contenido-principal">Ir al contenido</a>
      <Header categorias={categorias} cantidadCarrito={contarItems(carrito)} sesion={sesion} onCerrarSesion={salir} />
      <ToastContainer position="top-end" className="position-fixed p-3">
        <Toast key={aviso.id} show={aviso.visible} onClose={() => setAviso({ ...aviso, visible: false })} delay={3500} autohide>
          <Toast.Header closeLabel="Cerrar aviso">
            <strong className="me-auto">Carrito</strong>
          </Toast.Header>
          <Toast.Body>
            {aviso.texto} <Link to="/carrito">Ver carrito</Link>
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <main id="contenido-principal" className="flex-grow-1">
        {cargando && <Cargando />}
        {errorCarga && <Alert variant="danger" className="m-3">{errorCarga}</Alert>}
        {!cargando && !errorCarga && (
          <Routes>
            <Route path="/" element={<Inicio productos={productos} categorias={categorias} onAgregar={agregarAlCarrito} />} />
            <Route path="/productos" element={<Productos productos={productos} categorias={categorias} onAgregar={agregarAlCarrito} />} />
            <Route path="/productos/:id" element={<DetalleProducto productos={productos} categorias={categorias} onAgregar={agregarAlCarrito} />} />
            <Route path="/categorias" element={<Categorias categorias={categorias} productos={productos} />} />
            <Route path="/categorias/:slug" element={<Categoria categorias={categorias} productos={productos} onAgregar={agregarAlCarrito} />} />
            <Route path="/ofertas" element={<Ofertas productos={productos} onAgregar={agregarAlCarrito} />} />
            <Route path="/nosotros" element={<Nosotros categorias={categorias} />} />
            <Route path="/blog" element={<Blog entradas={blogSemilla} />} />
            <Route path="/blog/:id" element={<DetalleBlog entradas={blogSemilla} />} />
            <Route path="/contacto" element={<Contacto onEnviar={enviarConsulta} />} />
            <Route path="/login" element={<Login onIngresar={ingresar} />} />
            <Route path="/registro" element={<Registro onRegistrar={authService.registrarCliente} />} />
            <Route
              path="/carrito"
              element={<Carrito lineas={lineasCarrito} onCambiarCantidad={cambiarCantidadCarrito} onQuitar={quitarDelCarrito} onVaciar={() => setCarrito([])} />}
            />
            <Route path="/checkout" element={<Checkout lineas={lineasCarrito} onConfirmar={confirmarCompra} />} />

            {/* Panel: el administrador (ADMIN) ve todo; el vendedor (VENDEDOR) solo la lista y el detalle de
                productos y de órdenes. */}
            <Route path="/admin" element={esVendedor ? <Navigate to="/admin/ordenes" replace /> : panel(<AdminDashboard productos={productos} ordenes={ordenes} usuarios={usuarios} />)} />
            <Route path="/admin/ordenes" element={panel(<AdminOrdenes ordenes={ordenes} />, { vendedor: true })} />
            <Route path="/admin/ordenes/:id" element={panel(<AdminOrdenDetalle ordenes={ordenes} />, { vendedor: true })} />
            <Route path="/admin/productos" element={panel(<AdminProductos productos={productos} categorias={categorias} onEliminar={eliminarProducto} soloLectura={!esAdmin} />, { vendedor: true })} />
            <Route path="/admin/productos/nuevo" element={panel(<AdminProductoForm productos={productos} categorias={categorias} onCrear={crearProducto} onActualizar={actualizarProducto} />)} />
            <Route path="/admin/productos/criticos" element={panel(<AdminProductosCriticos productos={productos} categorias={categorias} />)} />
            <Route path="/admin/productos/:id" element={panel(<AdminProductoDetalle productos={productos} categorias={categorias} soloLectura={!esAdmin} />, { vendedor: true })} />
            <Route path="/admin/productos/:id/editar" element={panel(<AdminProductoForm productos={productos} categorias={categorias} onCrear={crearProducto} onActualizar={actualizarProducto} />)} />
            <Route path="/admin/categorias" element={panel(<AdminCategorias categorias={categorias} productos={productos} onEliminar={eliminarCategoria} />)} />
            <Route path="/admin/categorias/nueva" element={panel(<AdminCategoriaForm categorias={categorias} onCrear={crearCategoria} onActualizar={actualizarCategoria} />)} />
            <Route path="/admin/categorias/:id/editar" element={panel(<AdminCategoriaForm categorias={categorias} onCrear={crearCategoria} onActualizar={actualizarCategoria} />)} />
            <Route path="/admin/usuarios" element={panel(<AdminUsuarios usuarios={usuarios} onEliminar={eliminarUsuario} />)} />
            <Route path="/admin/usuarios/nuevo" element={panel(<AdminUsuarioForm usuarios={usuarios} onCrear={crearUsuario} onActualizar={actualizarUsuario} />)} />
            <Route path="/admin/usuarios/:id" element={panel(<AdminUsuarioDetalle usuarios={usuarios} />)} />
            <Route path="/admin/usuarios/:id/editar" element={panel(<AdminUsuarioForm usuarios={usuarios} onCrear={crearUsuario} onActualizar={actualizarUsuario} />)} />
            <Route path="/admin/reportes" element={panel(<AdminReportes ordenes={ordenes} productos={productos} categorias={categorias} />)} />

            <Route path="*" element={<NoEncontrada />} />
          </Routes>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
