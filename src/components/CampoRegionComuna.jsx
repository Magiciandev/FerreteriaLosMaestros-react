import { Col, Form, Row } from "react-bootstrap";
import { REGIONES_CHILE } from "../data/regiones";

// Par de listas dependientes: las comunas disponibles dependen de la región elegida.
// Props:
//   region, comuna            valores actuales
//   errorRegion, errorComuna  mensajes de error (opcionales)
//   onCambiar                 recibe un objeto con lo que cambió: { region, comuna } o { comuna }
//   prefijo                   prefijo de los ids, para poder usarlo más de una vez en una página
// Al cambiar la región se avisa también comuna: "", porque la comuna anterior ya no corresponde.
// Se usa en el registro, el perfil, el checkout y el formulario de usuarios.
function CampoRegionComuna({ region, comuna, errorRegion = "", errorComuna = "", onCambiar, prefijo = "direccion" }) {
  const comunas = REGIONES_CHILE.find((item) => item.region === region)?.comunas ?? [];

  return (
    <Row className="g-3 mb-3">
      <Col xs={12} md={6}>
        <Form.Group controlId={`${prefijo}-region`}>
          <Form.Label>Región</Form.Label>
          <Form.Select
            value={region}
            isInvalid={Boolean(errorRegion)}
            aria-describedby={errorRegion ? `${prefijo}-region-error` : undefined}
            onChange={(evento) => onCambiar({ region: evento.target.value, comuna: "" })}
          >
            <option value="">Selecciona una región</option>
            {REGIONES_CHILE.map((item) => (
              <option key={item.region} value={item.region}>{item.region}</option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid" id={`${prefijo}-region-error`}>{errorRegion}</Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col xs={12} md={6}>
        <Form.Group controlId={`${prefijo}-comuna`}>
          <Form.Label>Comuna</Form.Label>
          <Form.Select
            value={comuna}
            disabled={!region}
            isInvalid={Boolean(errorComuna)}
            aria-describedby={errorComuna ? `${prefijo}-comuna-error` : undefined}
            onChange={(evento) => onCambiar({ comuna: evento.target.value })}
          >
            <option value="">{region ? "Selecciona una comuna" : "Primero elige una región"}</option>
            {comunas.map((nombre) => (
              <option key={nombre} value={nombre}>{nombre}</option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid" id={`${prefijo}-comuna-error`}>{errorComuna}</Form.Control.Feedback>
        </Form.Group>
      </Col>
    </Row>
  );
}

export default CampoRegionComuna;
