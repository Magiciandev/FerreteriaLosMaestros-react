import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import PaginaPendiente from "./components/PaginaPendiente";
import { categoriasDB } from "./data/baseDeDatos";
import { useColeccion } from "./hooks/useColeccion";
import AdminLayout from "./layouts/AdminLayout";
import Layout from "./layouts/Layout";
import { borrarClave, guardarJSON, leerJSON } from "./utils/almacenamiento";

function App() {
  // Estado global de la aplicación. Vive en App y baja a los hijos por props.
  // Se inicializa desde localStorage para que sobreviva a recargar la página.
  const [sesion, setSesion] = useState(() => leerJSON("sesionActual", null));
  // Colecciones de la base de datos simulada, conectadas al estado de React.
  // Las demás (productos, usuarios, órdenes, blog) se conectan aquí a medida que las
  // vistas las necesitan.
  const categorias = useColeccion(categoriasDB);
  // carrito: arreglo de { idProducto, cantidad }. Se conecta a los botones en la Fase 3.
  const [carrito] = useState(() => leerJSON("carrito", []));

  // Cada vez que cambia la sesión, se guarda (o se borra) en localStorage.
  useEffect(() => {
    if (sesion) guardarJSON("sesionActual", sesion);
    else borrarClave("sesionActual");
  }, [sesion]);

  const cantidadCarrito = carrito.reduce((total, item) => total + item.cantidad, 0);

  return (
    <Routes>
      <Route
        element={
          <Layout
            categorias={categorias.items}
            cantidadCarrito={cantidadCarrito}
            sesion={sesion}
            onCerrarSesion={() => setSesion(null)}
          />
        }
      >
        <Route path="/" element={<PaginaPendiente titulo="Inicio" />} />
        <Route path="/productos" element={<PaginaPendiente titulo="Productos" />} />
        <Route path="/productos/:id" element={<PaginaPendiente titulo="Detalle de producto" />} />
        <Route path="/categorias/:slug" element={<PaginaPendiente titulo="Categoría" />} />
        <Route path="/ofertas" element={<PaginaPendiente titulo="Ofertas" />} />
        <Route path="/nosotros" element={<PaginaPendiente titulo="Nosotros" />} />
        <Route path="/blog" element={<PaginaPendiente titulo="Blog" />} />
        <Route path="/blog/:id" element={<PaginaPendiente titulo="Detalle del blog" />} />
        <Route path="/contacto" element={<PaginaPendiente titulo="Contacto" />} />
        <Route path="/login" element={<PaginaPendiente titulo="Iniciar sesión" />} />
        <Route path="/registro" element={<PaginaPendiente titulo="Crear cuenta" />} />
        <Route path="/perfil" element={<PaginaPendiente titulo="Mi perfil" />} />
        <Route path="/carrito" element={<PaginaPendiente titulo="Carrito de compras" />} />
        <Route path="/checkout" element={<PaginaPendiente titulo="Finalizar compra" />} />
        <Route path="/pago/exitoso" element={<PaginaPendiente titulo="Compra realizada" />} />
        <Route path="/pago/error" element={<PaginaPendiente titulo="No se pudo realizar el pago" />} />
        <Route path="*" element={<PaginaPendiente titulo="Página no encontrada" descripcion="La dirección no corresponde a ninguna página." />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<PaginaPendiente titulo="Dashboard" />} />
        <Route path="ordenes" element={<PaginaPendiente titulo="Órdenes y boletas" />} />
        <Route path="ordenes/:id" element={<PaginaPendiente titulo="Boleta" />} />
        <Route path="productos" element={<PaginaPendiente titulo="Productos" />} />
        <Route path="productos/nuevo" element={<PaginaPendiente titulo="Nuevo producto" />} />
        <Route path="productos/criticos" element={<PaginaPendiente titulo="Productos con stock crítico" />} />
        <Route path="productos/:id" element={<PaginaPendiente titulo="Detalle de producto" />} />
        <Route path="productos/:id/editar" element={<PaginaPendiente titulo="Editar producto" />} />
        <Route path="categorias" element={<PaginaPendiente titulo="Categorías" />} />
        <Route path="categorias/nueva" element={<PaginaPendiente titulo="Nueva categoría" />} />
        <Route path="categorias/:id/editar" element={<PaginaPendiente titulo="Editar categoría" />} />
        <Route path="usuarios" element={<PaginaPendiente titulo="Usuarios" />} />
        <Route path="usuarios/nuevo" element={<PaginaPendiente titulo="Nuevo usuario" />} />
        <Route path="usuarios/:id" element={<PaginaPendiente titulo="Detalle de usuario" />} />
        <Route path="usuarios/:id/editar" element={<PaginaPendiente titulo="Editar usuario" />} />
        <Route path="reportes" element={<PaginaPendiente titulo="Reportes" />} />
        <Route path="perfil" element={<PaginaPendiente titulo="Perfil" />} />
        <Route path="*" element={<PaginaPendiente titulo="Página no encontrada" />} />
      </Route>
    </Routes>
  );
}

export default App;
