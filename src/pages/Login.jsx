import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Link, Navigate, useLocation } from "react-router-dom";
import CampoFormulario from "../components/CampoFormulario";
import { useFormulario } from "../hooks/useFormulario";
import { validarCorreo, validarPassword } from "../utils/validaciones";

const VALIDADORES = { correo: validarCorreo, password: validarPassword };

// Inicio de sesión.
// Props:
//   sesion      sesión actual; si ya hay una, no tiene sentido mostrar el login y se redirige
//   onIngresar  función (correo, password) que devuelve true si las credenciales son correctas
// Si la persona llegó desde una página protegida, vuelve a ella después de ingresar
// (RutaProtegida deja esa dirección en location.state.desde).
// Estado propio: los campos (useFormulario) y si el último intento falló.
function Login({ sesion, onIngresar }) {
  const ubicacion = useLocation();
  const formulario = useFormulario({ correo: "", password: "" }, VALIDADORES);
  const [fallo, setFallo] = useState(false);

  if (sesion) return <Navigate to={ubicacion.state?.desde ?? "/"} replace />;

  function enviar(evento) {
    evento.preventDefault();
    if (!formulario.validarTodo()) return;
    const { correo, password } = formulario.datos;
    setFallo(!onIngresar(correo, password));
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={5}>
          <Card>
            <Card.Body className="p-4">
              <h1 className="h3 mb-3">Iniciar sesión</h1>
              {fallo && <Alert variant="danger" role="alert">Correo o contraseña incorrectos.</Alert>}
              <Form noValidate onSubmit={enviar} aria-label="Formulario de inicio de sesión">
                <CampoFormulario id="login-correo" etiqueta="Correo" tipo="email" autoComplete="username" {...formulario.campo("correo")} />
                <CampoFormulario id="login-password" etiqueta="Contraseña" tipo="password" autoComplete="current-password" {...formulario.campo("password")} />
                <div className="d-grid">
                  <Button type="submit" variant="primary">Iniciar sesión</Button>
                </div>
              </Form>
              <p className="mt-3 mb-0">
                ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
