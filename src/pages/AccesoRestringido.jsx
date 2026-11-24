import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

// Se muestra en el lugar del panel de administración cuando no hay una sesión de administrador.
function AccesoRestringido() {
  return (
    <Container className="py-5">
      <h1 className="h3">Acceso restringido</h1>
      <p>Esta sección es solo para el administrador. Inicia sesión con una cuenta de administrador para entrar.</p>
      <Link to="/login" className="btn btn-primary">Iniciar sesión</Link>
    </Container>
  );
}

export default AccesoRestringido;
