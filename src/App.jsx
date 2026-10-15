import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import PaginaPendiente from "./components/PaginaPendiente";
import RutaProtegida from "./components/RutaProtegida";
import { blogDB, categoriasDB, consultasDB, productosDB, usuariosDB } from "./data/baseDeDatos";
import { useColeccion } from "./hooks/useColeccion";
import AdminLayout from "./layouts/AdminLayout";
import Layout from "./layouts/Layout";
import Blog from "./pages/Blog";
import Categoria from "./pages/Categoria";
import Categorias from "./pages/Categorias";
import Contacto from "./pages/Contacto";
import DetalleBlog from "./pages/DetalleBlog";
import DetalleProducto from "./pages/DetalleProducto";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import NoEncontrada from "./pages/NoEncontrada";
import Nosotros from "./pages/Nosotros";
import Ofertas from "./pages/Ofertas";
import Perfil from "./pages/Perfil";
import Productos from "./pages/Productos";
import Registro from "./pages/Registro";
import { autenticar, crearSesion, encontrarDuplicado } from "./services/autenticacion";
import { borrarClave, guardarJSON, leerJSON } from "./utils/almacenamiento";
import { agregarItem, contarItems } from "./utils/carrito";

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
        <Route path="/carrito" element={<PaginaPendiente titulo="Carrito de compras" />} />
        <Route path="/checkout" element={<PaginaPendiente titulo="Finalizar compra" />} />
        <Route path="/pago/exitoso" element={<PaginaPendiente titulo="Compra realizada" />} />
        <Route path="/pago/error" element={<PaginaPendiente titulo="No se pudo realizar el pago" />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>

      {/* Panel: solo Administrador y Vendedor. El Vendedor ve productos y órdenes (listado y
          detalle); el resto es solo del Administrador (RF-09). */}
      <Route path="/admin" element={<RutaProtegida sesion={sesion} roles={["Administrador", "Vendedor"]} />}>
        <Route element={<AdminLayout sesion={sesion} />}>
          <Route index element={<PaginaPendiente titulo="Dashboard" />} />
          <Route path="ordenes" element={<PaginaPendiente titulo="Órdenes y boletas" />} />
          <Route path="ordenes/:id" element={<PaginaPendiente titulo="Boleta" />} />
          <Route path="productos" element={<PaginaPendiente titulo="Productos" />} />
          <Route path="productos/:id" element={<PaginaPendiente titulo="Detalle de producto" />} />
          <Route path="perfil" element={<PaginaPendiente titulo="Perfil" />} />

          <Route element={<RutaProtegida sesion={sesion} roles={["Administrador"]} />}>
            <Route path="productos/nuevo" element={<PaginaPendiente titulo="Nuevo producto" />} />
            <Route path="productos/criticos" element={<PaginaPendiente titulo="Productos con stock crítico" />} />
            <Route path="productos/:id/editar" element={<PaginaPendiente titulo="Editar producto" />} />
            <Route path="categorias" element={<PaginaPendiente titulo="Categorías" />} />
            <Route path="categorias/nueva" element={<PaginaPendiente titulo="Nueva categoría" />} />
            <Route path="categorias/:id/editar" element={<PaginaPendiente titulo="Editar categoría" />} />
            <Route path="usuarios" element={<PaginaPendiente titulo="Usuarios" />} />
            <Route path="usuarios/nuevo" element={<PaginaPendiente titulo="Nuevo usuario" />} />
            <Route path="usuarios/:id" element={<PaginaPendiente titulo="Detalle de usuario" />} />
            <Route path="usuarios/:id/editar" element={<PaginaPendiente titulo="Editar usuario" />} />
            <Route path="reportes" element={<PaginaPendiente titulo="Reportes" />} />
          </Route>

          <Route path="*" element={<NoEncontrada />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
