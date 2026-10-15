import { Navigate, Outlet, useLocation } from "react-router-dom";
import AccesoDenegado from "../pages/AccesoDenegado";

// Protege un grupo de rutas según la sesión y el rol. Se usa como "ruta de diseño": las rutas
// hijas se dibujan en el <Outlet /> solo si se cumplen las condiciones.
//   Sin sesión          -> lleva al login y recuerda a qué página quería entrar (state.desde).
//   Rol no permitido    -> muestra "Acceso restringido".
//   Todo en orden       -> deja pasar.
// Props:
//   sesion  null o { rol, ... }
//   roles   arreglo con los roles permitidos; si se omite, basta con haber iniciado sesión
function RutaProtegida({ sesion, roles }) {
  const ubicacion = useLocation();

  if (!sesion) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname + ubicacion.search }} />;
  }
  if (roles && !roles.includes(sesion.rol)) {
    return <AccesoDenegado rol={sesion.rol} />;
  }
  return <Outlet />;
}

export default RutaProtegida;
