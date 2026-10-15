import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

// Se muestra cuando la dirección no corresponde a ninguna página.
function NoEncontrada() {
  return (
    <Container className="py-5">
      <h1>Página no encontrada</h1>
      <p className="text-secondary">La dirección no corresponde a ninguna página de la tienda.</p>
      <Link to="/" className="btn btn-primary">Ir al inicio</Link>
    </Container>
  );
}

export default NoEncontrada;
