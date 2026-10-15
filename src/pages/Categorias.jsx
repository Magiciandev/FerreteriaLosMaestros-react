import { Col, Container, Row } from "react-bootstrap";
import TarjetaCategoria from "../components/TarjetaCategoria";

// Todas las categorías de la tienda, cada una con su cantidad de productos.
// Props: categorias y productos (para contar).
function Categorias({ categorias, productos }) {
  return (
    <Container className="py-4">
      <h1 className="mb-3">Categorías</h1>
      <Row className="g-3">
        {categorias.map((categoria) => (
          <Col key={categoria.slug} xs={12} sm={6} lg={4}>
            <TarjetaCategoria
              categoria={categoria}
              cantidad={productos.filter((producto) => producto.categoria === categoria.slug).length}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Categorias;
