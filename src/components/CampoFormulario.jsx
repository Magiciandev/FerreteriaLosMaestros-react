import { Form } from "react-bootstrap";

// Campo de formulario reutilizable: etiqueta + control + mensaje de error.
// Props:
//   id        -> identificador; une la etiqueta con el control
//   etiqueta  -> texto de la etiqueta
//   valor     -> valor actual (el estado lo guarda el formulario que lo usa)
//   error     -> mensaje de error; si viene vacío, el campo se ve normal
//   onChange  -> función que recibe el evento al escribir
//   tipo      -> type del input ("text", "email", "number"...)
//   como      -> "textarea" para campos de varias líneas, con "filas" de alto
//   ayuda     -> texto de apoyo bajo el campo
// El error se asocia al control con aria-describedby para que un lector de pantalla lo lea.
function CampoFormulario({ id, etiqueta, valor, error = "", onChange, tipo = "text", como, filas, ayuda, ...resto }) {
  const idError = `${id}-error`;
  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label>{etiqueta}</Form.Label>
      <Form.Control
        type={tipo}
        as={como}
        rows={filas}
        value={valor}
        onChange={onChange}
        isInvalid={Boolean(error)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? idError : undefined}
        {...resto}
      />
      {ayuda && <Form.Text muted>{ayuda}</Form.Text>}
      <Form.Control.Feedback type="invalid" id={idError}>
        {error}
      </Form.Control.Feedback>
    </Form.Group>
  );
}

export default CampoFormulario;
