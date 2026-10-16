import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

// Se muestra cuando hay sesión iniciada pero el rol no tiene permiso para esa página.
// Prop: rol, el rol de la persona (para explicarle por qué no puede entrar).
function AccesoDenegado({ rol }) {
  return (
    <Container className="py-5">
      <h1>Acceso restringido</h1>
      <p className="text-secondary">
        Tu rol ({rol}) no tiene permiso para ver esta página.
      </p>
      <Link to="/" className="btn btn-primary">Ir al inicio</Link>
    </Container>
  );
}

export default AccesoDenegado;
