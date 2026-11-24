import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import CampoFormulario from "../components/CampoFormulario";
import { validarCorreo, validarMensajeContacto, validarNombreContacto } from "../utils/validaciones";

const vacio = { nombre: "", correo: "", mensaje: "" };

// Formulario de contacto controlado: los valores y los errores viven en el estado (useState).
// Prop: onEnviar(datos), que guarda la consulta (devuelve una promesa).
function Contacto({ onEnviar }) {
  const [datos, setDatos] = useState(vacio);
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
    setEnviado(false);
  }

  async function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = {
      nombre: validarNombreContacto(datos.nombre),
      correo: validarCorreo(datos.correo),
      mensaje: validarMensajeContacto(datos.mensaje),
    };
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;

    setEnviando(true);
    setErrorServidor("");
    try {
      await onEnviar({ nombre: datos.nombre.trim(), correo: datos.correo.trim(), mensaje: datos.mensaje.trim() });
      setDatos(vacio);
      setEnviado(true);
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Container className="py-4">
      <h1 className="mb-3">Contacto</h1>
      <Row className="g-4">
        <Col xs={12} md={7}>
          {enviado && (
            <div className="alert alert-success" role="status">
              Gracias por escribirnos. Recibimos tu mensaje y te responderemos a tu correo.
            </div>
          )}
          {errorServidor && <div className="alert alert-danger" role="alert">{errorServidor}</div>}
          <Form noValidate onSubmit={enviar} aria-label="Formulario de contacto">
            <CampoFormulario id="contacto-nombre" etiqueta="Nombre" name="nombre" valor={datos.nombre} error={errores.nombre} onChange={cambiar} />
            <CampoFormulario id="contacto-correo" etiqueta="Correo" name="correo" tipo="email" valor={datos.correo} error={errores.correo} onChange={cambiar} />
            <CampoFormulario
              id="contacto-mensaje"
              etiqueta="Mensaje"
              name="mensaje"
              como="textarea"
              filas={5}
              valor={datos.mensaje}
              error={errores.mensaje}
              onChange={cambiar}
              ayuda="Entre 20 y 500 caracteres."
            />
            <Button type="submit" variant="primary" disabled={enviando}>{enviando ? "Enviando..." : "Enviar mensaje"}</Button>
          </Form>
        </Col>
        <Col xs={12} md={5}>
          <h2 className="h5">Escríbenos</h2>
          <p>Cuéntanos tu consulta sobre productos, despacho o compras para una obra y te responderemos al correo que indiques.</p>
        </Col>
      </Row>
    </Container>
  );
}

export default Contacto;
