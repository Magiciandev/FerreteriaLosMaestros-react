import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import CampoFormulario from "../components/CampoFormulario";

// Inicio de sesión. Valida que se escriban un correo y una contraseña y se los entrega a App
// (onIngresar), que consulta al servicio de autenticación. Si las credenciales son correctas,
// se lleva a la persona al panel (administrador) o al inicio (otros roles) con <Navigate>.
// Aquí NO se aplican las reglas del registro (dominios de correo, largo de la contraseña): lo que
// vale al iniciar sesión es lo que el servidor tiene guardado.
// Prop: onIngresar(correo, password), devuelve una promesa con el usuario ({ correo, rol }).
// Estado propio: los datos escritos, los errores, el mensaje del servidor, si se está enviando
// y el usuario que ingresó.
function Login({ onIngresar }) {
  const [datos, setDatos] = useState({ correo: "", password: "" });
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [usuario, setUsuario] = useState(null);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
    setErrorServidor("");
  }

  async function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = {
      correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim()) ? "" : "Escribe un correo válido.",
      password: datos.password === "" ? "Escribe tu contraseña." : "",
    };
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;

    setEnviando(true);
    try {
      setUsuario(await onIngresar(datos.correo.trim(), datos.password));
    } catch (error) {
      setErrorServidor(error.message);
      setEnviando(false);
    }
  }

  if (usuario) return <Navigate to={usuario.rol === "ADMIN" ? "/admin" : "/"} replace />;

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={5}>
          <div className="card">
            <div className="card-body p-4">
              <h1 className="h3 mb-3">Iniciar sesión</h1>
              {errorServidor && <div className="alert alert-danger" role="alert">{errorServidor}</div>}
              <Form noValidate onSubmit={enviar} aria-label="Formulario de inicio de sesión">
                <CampoFormulario id="login-correo" etiqueta="Correo" name="correo" tipo="email" autoComplete="username" valor={datos.correo} error={errores.correo} onChange={cambiar} />
                <CampoFormulario id="login-password" etiqueta="Contraseña" name="password" tipo="password" autoComplete="current-password" valor={datos.password} error={errores.password} onChange={cambiar} />
                <div className="d-grid">
                  <Button type="submit" variant="primary" disabled={enviando}>{enviando ? "Ingresando..." : "Iniciar sesión"}</Button>
                </div>
              </Form>
              <p className="mt-3 mb-0">
                ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
