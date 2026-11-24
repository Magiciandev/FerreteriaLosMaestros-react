import { Col, Container, Nav, Row } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const SECCIONES = [
  { to: "/admin", etiqueta: "Dashboard", end: true },
  { to: "/admin/ordenes", etiqueta: "Órdenes" },
  { to: "/admin/productos", etiqueta: "Productos" },
  { to: "/admin/categorias", etiqueta: "Categorías" },
  { to: "/admin/usuarios", etiqueta: "Usuarios" },
  { to: "/admin/reportes", etiqueta: "Reportes" },
];

// Estructura del panel de administración: menú lateral + la página que llega como children.
function PanelAdmin({ children }) {
  return (
    <Container fluid className="py-3">
      <Row>
        <Col xs={12} md={3} lg={2} className="mb-3 no-imprimir">
          <Nav as="nav" className="flex-column admin-menu" aria-label="Menú de administración">
            {SECCIONES.map((seccion) => (
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
