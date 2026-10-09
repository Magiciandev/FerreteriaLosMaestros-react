import { Container } from "react-bootstrap";

// Marcador de posición para las vistas que todavía no se construyen.
// Recibe el título y una descripción por props; se irá reemplazando fase a fase.
function PaginaPendiente({ titulo, descripcion = "Esta vista se construye en una fase siguiente." }) {
  return (
    <Container className="py-5">
      <h1>{titulo}</h1>
      <p className="text-secondary">{descripcion}</p>
    </Container>
  );
}

export default PaginaPendiente;
