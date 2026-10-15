import { useState } from "react";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import CampoFormulario from "../components/CampoFormulario";
import { validarCorreo, validarMensajeContacto, validarNombreContacto } from "../utils/validaciones";

const VACIO = { nombre: "", correo: "", mensaje: "" };

// Cada campo con su regla de validación (funciones de utils/validaciones.js).
const VALIDADORES = {
  nombre: validarNombreContacto,
  correo: validarCorreo,
  mensaje: validarMensajeContacto,
};

// Formulario de contacto controlado.
// Prop: onEnviar(datos), que guarda el mensaje (aquí, en la base de datos simulada).
// Estado propio: los valores de los campos, los errores y si el último envío fue exitoso.
// Los errores aparecen al salir de un campo (onBlur) y desaparecen apenas el valor es válido.
function Contacto({ onEnviar }) {
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);

  function cambiar(campo) {
    return (evento) => {
      const valor = evento.target.value;
      setDatos((actual) => ({ ...actual, [campo]: valor }));
      setEnviado(false);
      if (errores[campo]) setErrores((actual) => ({ ...actual, [campo]: VALIDADORES[campo](valor) }));
    };
  }

  function salirDeCampo(campo) {
    return () => setErrores((actual) => ({ ...actual, [campo]: VALIDADORES[campo](datos[campo]) }));
  }

  function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = {};
    for (const campo of Object.keys(VALIDADORES)) nuevosErrores[campo] = VALIDADORES[campo](datos[campo]);
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;

    onEnviar({ nombre: datos.nombre.trim(), correo: datos.correo.trim(), mensaje: datos.mensaje.trim() });
    setDatos(VACIO);
    setErrores({});
    setEnviado(true);
  }

  return (
    <Container className="py-4">
      <h1 className="mb-3">Contacto</h1>
      <Row className="g-4">
        <Col xs={12} md={7}>
          {enviado && (
            <Alert variant="success" role="status">
              Gracias por escribirnos. Recibimos tu mensaje y te responderemos a tu correo.
            </Alert>
          )}
          <Form noValidate onSubmit={enviar} aria-label="Formulario de contacto">
            <CampoFormulario
              id="contacto-nombre"
              etiqueta="Nombre"
              valor={datos.nombre}
              error={errores.nombre}
              onChange={cambiar("nombre")}
              onBlur={salirDeCampo("nombre")}
              autoComplete="name"
            />
            <CampoFormulario
              id="contacto-correo"
              etiqueta="Correo"
              tipo="email"
              valor={datos.correo}
              error={errores.correo}
              onChange={cambiar("correo")}
              onBlur={salirDeCampo("correo")}
              autoComplete="email"
            />
            <CampoFormulario
              id="contacto-mensaje"
              etiqueta="Mensaje"
              como="textarea"
              filas={5}
              valor={datos.mensaje}
              error={errores.mensaje}
              ayuda={`Entre 20 y 500 caracteres (${datos.mensaje.length}/500).`}
              onChange={cambiar("mensaje")}
              onBlur={salirDeCampo("mensaje")}
            />
            <Button type="submit" variant="primary">Enviar mensaje</Button>
          </Form>
        </Col>
        <Col xs={12} md={5}>
          <h2 className="h5">Escríbenos</h2>
          <p>
            Cuéntanos tu consulta sobre productos, despacho o compras para una obra y te responderemos
            al correo que indiques.
          </p>
          <p className="small text-secondary">
            Este sitio es un proyecto académico: el mensaje se guarda solo en este navegador, no se
            envía a ningún servidor.
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default Contacto;
