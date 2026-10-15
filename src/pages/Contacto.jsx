import { useState } from "react";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import CampoFormulario from "../components/CampoFormulario";
import { useFormulario } from "../hooks/useFormulario";
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
// Los valores y errores los maneja useFormulario; este componente solo guarda si el último
// envío fue exitoso. Los errores aparecen al salir de un campo y desaparecen al corregirlo.
function Contacto({ onEnviar }) {
  const formulario = useFormulario(VACIO, VALIDADORES);
  const [enviado, setEnviado] = useState(false);

  // Igual que formulario.campo(), pero además oculta el aviso de éxito al volver a escribir.
  function campo(nombre) {
    return {
      ...formulario.campo(nombre),
      onChange: (evento) => {
        setEnviado(false);
        formulario.cambiar(nombre, evento.target.value);
      },
    };
  }

  function enviar(evento) {
    evento.preventDefault();
    if (!formulario.validarTodo()) return;

    const { nombre, correo, mensaje } = formulario.datos;
    onEnviar({ nombre: nombre.trim(), correo: correo.trim(), mensaje: mensaje.trim() });
    formulario.reiniciar();
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
            <CampoFormulario id="contacto-nombre" etiqueta="Nombre" autoComplete="name" {...campo("nombre")} />
            <CampoFormulario id="contacto-correo" etiqueta="Correo" tipo="email" autoComplete="email" {...campo("correo")} />
            <CampoFormulario
              id="contacto-mensaje"
              etiqueta="Mensaje"
              como="textarea"
              filas={5}
              ayuda={`Entre 20 y 500 caracteres (${formulario.datos.mensaje.length}/500).`}
              {...campo("mensaje")}
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
