import { Col, Container, Nav, Row } from "react-bootstrap";
import { NavLink } from "react-router-dom";

// "soloAdmin" marca las secciones que el vendedor no ve: él solo accede a Órdenes y Productos.
const SECCIONES = [
  { to: "/admin", etiqueta: "Dashboard", end: true, soloAdmin: true },
  { to: "/admin/ordenes", etiqueta: "Órdenes" },
  { to: "/admin/productos", etiqueta: "Productos" },
  { to: "/admin/categorias", etiqueta: "Categorías", soloAdmin: true },
  { to: "/admin/usuarios", etiqueta: "Usuarios", soloAdmin: true },
  { to: "/admin/reportes", etiqueta: "Reportes", soloAdmin: true },
];

// Estructura del panel: menú lateral + la página que llega como children. Con esAdmin = false (el
// vendedor) el menú solo muestra las secciones que no son soloAdmin.
function PanelAdmin({ children, esAdmin = true }) {
  const secciones = SECCIONES.filter((seccion) => esAdmin || !seccion.soloAdmin);
  return (
    <Container fluid className="py-3">
      <Row>
        <Col xs={12} md={3} lg={2} className="mb-3 no-imprimir">
          <Nav as="nav" className="flex-column admin-menu" aria-label="Menú de administración">
            {secciones.map((seccion) => (
              <Nav.Link as={NavLink} to={seccion.to} end={seccion.end} key={seccion.to}>
                {seccion.etiqueta}
              </Nav.Link>
            ))}
            <Nav.Link as={NavLink} to="/" className="mt-3">Volver a la tienda</Nav.Link>
          </Nav>
        </Col>
        <Col xs={12} md={9} lg={10}>{children}</Col>
      </Row>
    </Container>
  );
}

export default PanelAdmin;
