import { Container } from "react-bootstrap";

// Marcador de posición para las vistas que todavía no se construyen.
// Recibe el título y, opcionalmente, una descripción por props.
function PaginaPendiente({ titulo, descripcion = "Contenido no disponible." }) {
  return (
    <Container className="py-5">
      <h1>{titulo}</h1>
      <p className="text-secondary">{descripcion}</p>
    </Container>
  );
}

export default PaginaPendiente;
