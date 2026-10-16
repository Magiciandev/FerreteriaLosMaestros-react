import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import RutaProtegida from "./components/RutaProtegida";
import { blogDB, categoriasDB, consultasDB, ordenesDB, productosDB, usuariosDB } from "./data/baseDeDatos";
import { useColeccion } from "./hooks/useColeccion";
import AdminLayout from "./layouts/AdminLayout";
import Layout from "./layouts/Layout";
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
import PagoError from "./pages/PagoError";
import PagoExitoso from "./pages/PagoExitoso";
import Perfil from "./pages/Perfil";
import Productos from "./pages/Productos";
import Registro from "./pages/Registro";
import { autenticar, crearSesion, encontrarDuplicado } from "./services/autenticacion";
import { construirOrden } from "./services/compras";
import { borrarClave, guardarJSON, leerJSON } from "./utils/almacenamiento";
import { agregarItem, cambiarCantidad, contarItems, detallarCarrito, quitarItem } from "./utils/carrito";


function App() {
  // Estado global de la aplicación. Vive en App y baja a las páginas por props.
  // Se inicializa desde localStorage para que sobreviva a recargar la página.
  const [sesion, setSesion] = useState(() => leerJSON("sesionActual", null));
  // carrito: arreglo de { idProducto, cantidad }.
  const [carrito, setCarrito] = useState(() => leerJSON("carrito", []));
  // Aviso que se muestra al agregar un producto al carrito.
  const [aviso, setAviso] = useState({ mensaje: "", visible: false });

  // Colecciones de la base de datos simulada, conectadas al estado de React.
  // Las demás (usuarios, órdenes) se conectan aquí cuando las vistas las necesiten.
  const productos = useColeccion(productosDB);
  const categorias = useColeccion(categoriasDB);
  const blog = useColeccion(blogDB);
  const usuarios = useColeccion(usuariosDB);
  const ordenes = useColeccion(ordenesDB);

  // Cada vez que cambia la sesión o el carrito, se guardan (o se borran) en localStorage.
  useEffect(() => {
    if (sesion) guardarJSON("sesionActual", sesion);
    else borrarClave("sesionActual");
  }, [sesion]);

  useEffect(() => {
    guardarJSON("carrito", carrito);
  }, [carrito]);

  // Agrega un producto al carrito (sin superar su stock) y avisa al usuario.
  function agregarAlCarrito(producto, cantidad = 1) {
    setCarrito((actual) => agregarItem(actual, producto.id, cantidad, producto.stock));
    setAviso({ mensaje: `${producto.nombre} se agregó al carrito.`, visible: true });
  }

  // El carrito guarda solo { idProducto, cantidad }; para mostrarlo se reconstruye contra el
  // catálogo actual (precios con oferta, stock al día).
  const lineasCarrito = detallarCarrito(carrito, productos.items);

  // Solo el Administrador crea, edita y elimina en el panel; el Vendedor únicamente consulta.
  const esAdministrador = sesion?.rol === "Administrador";

  function cambiarCantidadCarrito(idProducto, cantidad) {
    const producto = productos.items.find((item) => item.id === idProducto);
    setCarrito((actual) => cambiarCantidad(actual, idProducto, cantidad, producto?.stock ?? 0));
  }

  function quitarDelCarrito(idProducto) {
    setCarrito((actual) => quitarItem(actual, idProducto));
  }

  // Registra el intento de compra como una orden. Si el pago fue aprobado, descuenta el stock de
  // cada producto y vacía el carrito; si fue rechazado, deja todo como estaba (el carrito se
  // conserva para reintentar). Devuelve la orden guardada.
  function confirmarCompra(datos, aprobado) {
    const orden = ordenes.crear(construirOrden({ datos, lineas: lineasCarrito, aprobado, idUsuario: sesion?.id ?? null }));
    if (aprobado) {
      for (const linea of lineasCarrito) {
        productos.actualizar(linea.idProducto, { stock: linea.stock - linea.cantidad });
      }
      setCarrito([]);
    }
    return orden;
  }

  // Inicia sesión si el correo y la contraseña coinciden con un usuario. Devuelve true o false.
  function iniciarSesion(correo, password) {
    const usuario = autenticar(usuarios.items, correo, password);
    if (!usuario) return false;
    setSesion(crearSesion(usuario));
    return true;
  }

  // Crea una cuenta de cliente y deja la sesión iniciada. Si el correo o el RUN ya existen,
  // devuelve el error para que el formulario lo muestre junto al campo.
  function registrarCliente(datos) {
    const duplicado = encontrarDuplicado(usuarios.items, datos);
    if (duplicado) return { ok: false, ...duplicado };
    const nuevo = usuarios.crear({
      ...datos,
      correo: datos.correo.trim().toLowerCase(),
      run: datos.run.trim().toUpperCase(),
      tipo: "cliente",
      rol: "Cliente",
    });
    setSesion(crearSesion(nuevo));
    return { ok: true };
  }

  // Guarda los cambios del perfil y mantiene la sesión al día con el nombre nuevo.
  function actualizarPerfil(cambios) {
    usuarios.actualizar(sesion.id, cambios);
    setSesion((actual) => ({ ...actual, nombre: cambios.nombre, apellidos: cambios.apellidos }));
  }

  // Edición de un usuario desde el panel. Si el Administrador edita su propia cuenta, la sesión
  // se actualiza con los datos nuevos para que el menú no muestre el nombre anterior.
  function actualizarUsuario(id, cambios) {
    usuarios.actualizar(id, cambios);
    if (sesion?.id === id) {
      setSesion((actual) => ({ ...actual, nombre: cambios.nombre, apellidos: cambios.apellidos, correo: cambios.correo }));
    }
  }

  // Guarda el mensaje del formulario de contacto en la base de datos simulada.
  function enviarConsulta(datos) {
    consultasDB.crear({ ...datos, fecha: new Date().toISOString() });
  }

  return (
    <Routes>
      <Route
        element={
          <Layout
            categorias={categorias.items}
            cantidadCarrito={contarItems(carrito)}
            sesion={sesion}
            onCerrarSesion={() => setSesion(null)}
            aviso={aviso}
            onCerrarAviso={() => setAviso((actual) => ({ ...actual, visible: false }))}
          />
        }
      >
        <Route path="/" element={<Inicio productos={productos.items} categorias={categorias.items} onAgregar={agregarAlCarrito} />} />
        <Route path="/productos" element={<Productos productos={productos.items} categorias={categorias.items} onAgregar={agregarAlCarrito} />} />
        <Route path="/productos/:id" element={<DetalleProducto productos={productos.items} categorias={categorias.items} onAgregar={agregarAlCarrito} />} />
        <Route path="/categorias" element={<Categorias categorias={categorias.items} productos={productos.items} />} />
        <Route path="/categorias/:slug" element={<Categoria categorias={categorias.items} productos={productos.items} onAgregar={agregarAlCarrito} />} />
        <Route path="/ofertas" element={<Ofertas productos={productos.items} onAgregar={agregarAlCarrito} />} />
        <Route path="/nosotros" element={<Nosotros categorias={categorias.items} />} />
        <Route path="/blog" element={<Blog entradas={blog.items} />} />
        <Route path="/blog/:id" element={<DetalleBlog entradas={blog.items} />} />
        <Route path="/contacto" element={<Contacto onEnviar={enviarConsulta} />} />
        <Route path="/login" element={<Login sesion={sesion} onIngresar={iniciarSesion} />} />
        <Route path="/registro" element={<Registro sesion={sesion} onRegistrar={registrarCliente} />} />
        <Route element={<RutaProtegida sesion={sesion} />}>
          <Route
            path="/perfil"
            element={<Perfil usuario={usuarios.items.find((usuario) => usuario.id === sesion?.id)} onGuardar={actualizarPerfil} />}
          />
        </Route>
        <Route
          path="/carrito"
          element={<Carrito lineas={lineasCarrito} onCambiarCantidad={cambiarCantidadCarrito} onQuitar={quitarDelCarrito} onVaciar={() => setCarrito([])} />}
        />
        <Route
          path="/checkout"
          element={<Checkout lineas={lineasCarrito} usuario={usuarios.items.find((usuario) => usuario.id === sesion?.id)} onConfirmar={confirmarCompra} />}
        />
        <Route path="/pago/exitoso" element={<PagoExitoso ordenes={ordenes.items} />} />
        <Route path="/pago/error" element={<PagoError ordenes={ordenes.items} />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>

      {/* Panel: solo Administrador y Vendedor. El Vendedor ve productos y órdenes (listado y
          detalle); el resto es solo del Administrador (RF-09). */}
      <Route path="/admin" element={<RutaProtegida sesion={sesion} roles={["Administrador", "Vendedor"]} />}>
        <Route element={<AdminLayout sesion={sesion} />}>
          <Route
            index
            element={<AdminDashboard productos={productos.items} ordenes={ordenes.items} usuarios={usuarios.items} esAdministrador={esAdministrador} />}
          />
          <Route path="ordenes" element={<AdminOrdenes ordenes={ordenes.items} />} />
          <Route path="ordenes/:id" element={<AdminOrdenDetalle ordenes={ordenes.items} esAdministrador={esAdministrador} />} />
          <Route
            path="productos"
            element={<AdminProductos productos={productos.items} categorias={categorias.items} esAdministrador={esAdministrador} onEliminar={productos.eliminar} />}
          />
          <Route
            path="productos/:id"
            element={<AdminProductoDetalle productos={productos.items} categorias={categorias.items} esAdministrador={esAdministrador} />}
          />
          {/* Mismo componente que el perfil de la tienda: para el personal muestra sus datos
              (se administran desde Usuarios). */}
          <Route
            path="perfil"
            element={<Perfil usuario={usuarios.items.find((usuario) => usuario.id === sesion?.id)} onGuardar={actualizarPerfil} />}
          />

          <Route element={<RutaProtegida sesion={sesion} roles={["Administrador"]} />}>
            {/* El mismo formulario sirve para crear (sin :id) y editar (con :id). */}
            <Route
              path="productos/nuevo"
              element={<AdminProductoForm productos={productos.items} categorias={categorias.items} onCrear={productos.crear} onActualizar={productos.actualizar} />}
            />
            <Route path="productos/criticos" element={<AdminProductosCriticos productos={productos.items} categorias={categorias.items} />} />
            <Route
              path="productos/:id/editar"
              element={<AdminProductoForm productos={productos.items} categorias={categorias.items} onCrear={productos.crear} onActualizar={productos.actualizar} />}
            />
            <Route
              path="categorias"
              element={<AdminCategorias categorias={categorias.items} productos={productos.items} onEliminar={categorias.eliminar} />}
            />
            <Route
              path="categorias/nueva"
              element={<AdminCategoriaForm categorias={categorias.items} onCrear={categorias.crear} onActualizar={categorias.actualizar} />}
            />
            <Route
              path="categorias/:id/editar"
              element={<AdminCategoriaForm categorias={categorias.items} onCrear={categorias.crear} onActualizar={categorias.actualizar} />}
            />
            <Route path="usuarios" element={<AdminUsuarios usuarios={usuarios.items} sesion={sesion} onEliminar={usuarios.eliminar} />} />
            <Route
              path="usuarios/nuevo"
              element={<AdminUsuarioForm usuarios={usuarios.items} sesion={sesion} onCrear={usuarios.crear} onActualizar={actualizarUsuario} />}
            />
            <Route path="usuarios/:id" element={<AdminUsuarioDetalle usuarios={usuarios.items} ordenes={ordenes.items} />} />
            <Route
              path="usuarios/:id/editar"
              element={<AdminUsuarioForm usuarios={usuarios.items} sesion={sesion} onCrear={usuarios.crear} onActualizar={actualizarUsuario} />}
            />
            <Route path="reportes" element={<AdminReportes ordenes={ordenes.items} productos={productos.items} categorias={categorias.items} />} />
          </Route>

          <Route path="*" element={<NoEncontrada />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;