import { Col, Container, Row } from "react-bootstrap";
import TarjetaBlog from "../components/TarjetaBlog";

// Listado de entradas del blog. Prop: entradas (arreglo de { id, titulo, resumen, autor, fecha }).
function Blog({ entradas }) {
  return (
    <Container className="py-4">
      <h1 className="mb-1">Blog</h1>
      <p className="text-secondary mb-4">Consejos y guías para tus proyectos de construcción y reparación.</p>
      <Row className="g-3">
        {entradas.map((entrada) => (
          <Col key={entrada.id} xs={12} md={6}>
            <TarjetaBlog entrada={entrada} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Blog;
