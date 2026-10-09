import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

// Pie de página: solo muestra información fija, no recibe props ni maneja estado.
function Footer() {
  return (
    <footer className="pie-sitio mt-5 py-4">
      <Container>
        <Row className="g-4">
          <Col xs={12} md={6}>
            <h2 className="h5">Ferretería Los Maestros</h2>
            <p className="mb-0">
              Materiales de construcción, herramientas y gasfitería para particulares y contratistas.
            </p>
          </Col>
          <Col xs={6} md={3}>
            <h2 className="h6">Tienda</h2>
            <ul className="list-unstyled mb-0">
              <li><Link to="/productos">Productos</Link></li>
              <li><Link to="/ofertas">Ofertas</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </Col>
          <Col xs={6} md={3}>
            <h2 className="h6">Ayuda</h2>
            <ul className="list-unstyled mb-0">
              <li><Link to="/nosotros">Nosotros</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </Col>
        </Row>
        <p className="pie-legal mt-4 mb-0">Proyecto académico · Desarrollo FullStack II</p>
      </Container>
    </footer>
  );
}

export default Footer;
