import { Alert, Col, Row } from "react-bootstrap";
import TarjetaProducto from "./TarjetaProducto";

// Lista de tarjetas de producto en una grilla que se adapta al ancho de la pantalla:
// 1 columna en móvil, 2 en tablet, 3 en escritorio y 4 en pantallas grandes.
// Si no hay productos, muestra un mensaje en lugar de una grilla vacía.
function GrillaProductos({ productos, onAgregar, mensajeVacio = "No hay productos para mostrar." }) {
  if (productos.length === 0) {
    return <Alert variant="light" className="border">{mensajeVacio}</Alert>;
  }
  return (
    <Row as="ul" className="list-unstyled g-3 mb-0">
      {productos.map((producto) => (
        <Col as="li" key={producto.id} xs={12} sm={6} lg={4} xl={3}>
          <TarjetaProducto producto={producto} onAgregar={onAgregar} />
        </Col>
      ))}
    </Row>
  );
}

export default GrillaProductos;
