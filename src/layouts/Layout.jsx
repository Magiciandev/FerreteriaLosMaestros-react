import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

// Estructura común de la tienda: encabezado + contenido de la ruta + pie.
// <Outlet /> es el hueco donde React Router dibuja la página que corresponda a la URL.
function Layout({ categorias, cantidadCarrito, sesion, onCerrarSesion }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <a className="salto-contenido" href="#contenido-principal">Ir al contenido</a>
      <Header
        categorias={categorias}
        cantidadCarrito={cantidadCarrito}
        sesion={sesion}
        onCerrarSesion={onCerrarSesion}
      />
      <main id="contenido-principal" className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
