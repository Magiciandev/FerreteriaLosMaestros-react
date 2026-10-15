import { Col, Container, Nav, Row } from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";

// Secciones del panel. Las marcadas soloAdmin no se muestran al Vendedor, que solo puede ver
// productos y órdenes (RF-09 del ERS). El bloqueo real lo hace RutaProtegida en App; ocultar el
// enlace solo evita mostrar opciones a las que no podría entrar.
const SECCIONES = [
  { to: "/admin", etiqueta: "Dashboard", end: true },
  { to: "/admin/ordenes", etiqueta: "Órdenes" },
  { to: "/admin/productos", etiqueta: "Productos" },
  { to: "/admin/categorias", etiqueta: "Categorías", soloAdmin: true },
  { to: "/admin/usuarios", etiqueta: "Usuarios", soloAdmin: true },
  { to: "/admin/reportes", etiqueta: "Reportes", soloAdmin: true },
  { to: "/admin/perfil", etiqueta: "Perfil" },
];

// Estructura del panel de administración: menú lateral + contenido de la ruta.
// Prop: sesion, para mostrar quién ingresó y qué secciones corresponden a su rol.
function AdminLayout({ sesion = null }) {
  const esAdministrador = sesion?.rol === "Administrador";
  const secciones = SECCIONES.filter((seccion) => !seccion.soloAdmin || esAdministrador);

  return (
    <Container fluid className="py-3">
      <Row>
        <Col xs={12} md={3} lg={2} className="mb-3">
          {sesion && (
            <p className="small text-secondary mb-2">
              {sesion.nombre} {sesion.apellidos} ({sesion.rol})
            </p>
          )}
          <Nav as="nav" className="flex-column admin-menu" aria-label="Menú de administración">
            {secciones.map((seccion) => (
              <Nav.Link as={NavLink} to={seccion.to} end={seccion.end} key={seccion.to}>
                {seccion.etiqueta}
              </Nav.Link>
            ))}
            <Nav.Link as={NavLink} to="/" className="mt-3">Volver a la tienda</Nav.Link>
          </Nav>
        </Col>
        <Col xs={12} md={9} lg={10}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
}

export default AdminLayout;
