import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CampoFormulario from "../components/CampoFormulario";
import CampoRegionComuna from "../components/CampoRegionComuna";
import TablaItems from "../components/TablaItems";
import { useFormulario } from "../hooks/useFormulario";
import { OPCIONES_ENTREGA, requiereDireccion } from "../services/compras";
import { calcularTotal } from "../utils/carrito";
import { formatearCLP } from "../utils/formato";
import {
  validarApellidos, validarComuna, validarCorreo, validarDepartamento, validarDireccion,
  validarIndicaciones, validarNombre, validarOpcionEntrega, validarRegion,
} from "../utils/validaciones";

// Los datos de dirección solo se exigen cuando la compra se despacha.
const sinRetiro = (validador) => (valor, todos) => (requiereDireccion(todos.entrega) ? validador(valor) : "");

const VALIDADORES = {
  nombre: validarNombre,
  apellidos: validarApellidos,
  correo: validarCorreo,
  entrega: validarOpcionEntrega,
  calle: sinRetiro(validarDireccion),
  departamento: validarDepartamento,
  region: sinRetiro(validarRegion),
  comuna: sinRetiro(validarComuna),
  indicaciones: validarIndicaciones,
};

// Valores con los que parte el formulario: los de un intento anterior (si se vuelve desde un
// pago rechazado) o, si hay sesión, los datos de la cuenta; si no, vacío.
function valoresIniciales(usuario, previos) {
  if (previos) return previos;
  return {
    nombre: usuario?.nombre ?? "",
    apellidos: usuario?.apellidos ?? "",
    correo: usuario?.correo ?? "",
    entrega: "domicilio",
    calle: usuario?.direccion ?? "",
    departamento: "",
    region: usuario?.region ?? "",
    comuna: usuario?.comuna ?? "",
    indicaciones: "",
  };
}

// Checkout: datos del cliente, forma de entrega y pago.
// Props:
//   lineas      productos del carrito (detallarCarrito)
//   usuario     el usuario con sesión, o undefined; sus datos se completan solos
//   onConfirmar (datos, aprobado) guarda la orden y devuelve { id }
// Como no se procesan pagos reales, la persona elige qué resultado simular (aprobado o rechazado)
// para poder ver las dos pantallas finales.
function Checkout({ lineas, usuario, onConfirmar }) {
  const ubicacion = useLocation();
  const navigate = useNavigate();
  const formulario = useFormulario(valoresIniciales(usuario, ubicacion.state?.datos), VALIDADORES);
  const [resultadoPago, setResultadoPago] = useState("aprobado");

  if (lineas.length === 0) {
    return (
      <Container className="py-5">
        <h1>Finalizar compra</h1>
        <Alert variant="light" className="border">No hay productos en tu carrito.</Alert>
        <Link to="/productos" className="btn btn-primary">Ver productos</Link>
      </Container>
    );
  }

  const total = calcularTotal(lineas);
  const { datos, errores } = formulario;

  function pagar(evento) {
    evento.preventDefault();
    if (!formulario.validarTodo()) return;
    const aprobado = resultadoPago === "aprobado";
    const orden = onConfirmar(datos, aprobado);
    navigate(`/pago/${aprobado ? "exitoso" : "error"}?orden=${orden.id}`, { replace: true });
  }

  return (
    <Container className="py-4">
      <h1 className="mb-3">Finalizar compra</h1>
      {usuario && <Alert variant="info" className="py-2">Completamos tus datos con los de tu cuenta. Puedes modificarlos.</Alert>}
      <Row className="g-4">
        <Col xs={12} lg={7}>
          <Form noValidate onSubmit={pagar} aria-label="Formulario de compra">
            <h2 className="h5">Información del cliente</h2>
            <Row>
              <Col xs={12} md={6}><CampoFormulario id="checkout-nombre" etiqueta="Nombre" autoComplete="given-name" {...formulario.campo("nombre")} /></Col>
              <Col xs={12} md={6}><CampoFormulario id="checkout-apellidos" etiqueta="Apellidos" autoComplete="family-name" {...formulario.campo("apellidos")} /></Col>
            </Row>
            <CampoFormulario id="checkout-correo" etiqueta="Correo" tipo="email" autoComplete="email" {...formulario.campo("correo")} />

            <h2 className="h5 mt-2">Entrega</h2>
            <fieldset className="mb-3">
              <legend className="visually-hidden">Forma de entrega</legend>
              {OPCIONES_ENTREGA.map((opcion) => (
                <Form.Check
                  key={opcion.id}
                  type="radio"
                  id={`entrega-${opcion.id}`}
                  name="entrega"
                  label={opcion.etiqueta}
                  value={opcion.id}
                  checked={datos.entrega === opcion.id}
                  onChange={(evento) => formulario.cambiar("entrega", evento.target.value)}
                />
              ))}
              {errores.entrega && <div className="text-danger small mt-1" role="alert">{errores.entrega}</div>}
            </fieldset>

            {requiereDireccion(datos.entrega) && (
              <>
                <h2 className="h5">Dirección de entrega</h2>
                <Row>
                  <Col xs={12} md={8}><CampoFormulario id="checkout-calle" etiqueta="Calle y número" autoComplete="street-address" {...formulario.campo("calle")} /></Col>
                  <Col xs={12} md={4}><CampoFormulario id="checkout-departamento" etiqueta="Departamento (opcional)" {...formulario.campo("departamento")} /></Col>
                </Row>
                <CampoRegionComuna
                  prefijo="checkout"
                  region={datos.region}
                  comuna={datos.comuna}
                  errorRegion={errores.region}
                  errorComuna={errores.comuna}
                  onCambiar={formulario.establecer}
                />
                <CampoFormulario id="checkout-indicaciones" etiqueta="Indicaciones para la entrega (opcional)" como="textarea" filas={3} {...formulario.campo("indicaciones")} />
              </>
            )}

            <h2 className="h5 mt-2">Pago</h2>
            <Form.Group className="mb-4" controlId="checkout-resultado">
              <Form.Label>Resultado del pago (simulación)</Form.Label>
              <Form.Select value={resultadoPago} onChange={(evento) => setResultadoPago(evento.target.value)}>
                <option value="aprobado">Pago aprobado</option>
                <option value="rechazado">Pago rechazado</option>
              </Form.Select>
              <Form.Text muted>Este sitio no procesa pagos reales: elige qué resultado quieres simular.</Form.Text>
            </Form.Group>

            <Button type="submit" variant="primary" size="lg">Pagar ahora {formatearCLP(total)}</Button>
          </Form>
        </Col>
        <Col xs={12} lg={5}>
          <Card>
            <Card.Body>
              <h2 className="h5">Tu pedido</h2>
              <TablaItems items={lineas} total={total} />
              <Link to="/carrito">Modificar carrito</Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Checkout;
