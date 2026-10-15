import { Outlet } from "react-router-dom";
import AvisoCarrito from "../components/AvisoCarrito";
import Footer from "../components/Footer";
import Header from "../components/Header";

// Estructura común de la tienda: encabezado + contenido de la ruta + pie + aviso del carrito.
// <Outlet /> es el hueco donde React Router dibuja la página que corresponda a la URL.
function Layout({ categorias, cantidadCarrito, sesion, onCerrarSesion, aviso, onCerrarAviso }) {
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
      <AvisoCarrito mensaje={aviso.mensaje} visible={aviso.visible} onCerrar={onCerrarAviso} />
    </div>
  );
}

export default Layout;
