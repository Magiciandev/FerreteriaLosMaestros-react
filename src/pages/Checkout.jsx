import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import CampoFormulario from "../components/CampoFormulario";
import CampoRegionComuna from "../components/CampoRegionComuna";
import PagoError from "../components/PagoError";
import PagoExitoso from "../components/PagoExitoso";
import TablaItems from "../components/TablaItems";
import { OPCIONES_ENTREGA, requiereDireccion } from "../services/compras";
import { calcularTotal } from "../utils/carrito";
import { formatearCLP } from "../utils/formato";
import {
  validarApellidos, validarComuna, validarCorreo, validarDepartamento, validarDireccion,
  validarIndicaciones, validarNombre, validarRegion,
} from "../utils/validaciones";

const VACIO = {
  nombre: "", apellidos: "", correo: "", entrega: "domicilio",
  calle: "", departamento: "", region: "", comuna: "", indicaciones: "",
};

// Revisa los datos del formulario y devuelve un error (o "") por campo.
function validar(datos) {
  const errores = {
    nombre: validarNombre(datos.nombre),
    apellidos: validarApellidos(datos.apellidos),
    correo: validarCorreo(datos.correo),
    departamento: validarDepartamento(datos.departamento),
    indicaciones: validarIndicaciones(datos.indicaciones),
  };
  // Los datos de dirección solo se exigen cuando la compra se despacha.
  if (requiereDireccion(datos.entrega)) {
    errores.calle = validarDireccion(datos.calle);
    errores.region = validarRegion(datos.region);
    errores.comuna = validarComuna(datos.comuna);
  }
  return errores;
}

// Checkout: datos del cliente, forma de entrega y pago.
// Props:
//   lineas      productos del carrito (detallarCarrito)
//   onConfirmar (datos, aprobado) registra la compra en el servidor y devuelve la orden (promesa)
// Como no se procesan pagos reales, la persona elige qué resultado simular (aprobado o rechazado)
// para poder ver las dos pantallas finales. El resultado se muestra en esta misma página:
// "orden" guarda la orden registrada y, si existe, se dibuja PagoExitoso o PagoError.
function Checkout({ lineas, onConfirmar }) {
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [resultadoPago, setResultadoPago] = useState("aprobado");
  const [orden, setOrden] = useState(null);
  const [errorServidor, setErrorServidor] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
  }

  async function pagar(evento) {
    evento.preventDefault();
    const nuevosErrores = validar(datos);
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;
    setEnviando(true);
    setErrorServidor("");
    try {
      setOrden(await onConfirmar(datos, resultadoPago === "aprobado"));
    } catch (error) {
      // Por ejemplo, "Stock insuficiente de ...": se muestra y el carrito se conserva.
      setErrorServidor(error.message);
    } finally {
      setEnviando(false);
    }
  }

  if (orden?.estado === "pagada") return <PagoExitoso orden={orden} />;
  if (orden) return <PagoError orden={orden} onReintentar={() => setOrden(null)} />;

  if (lineas.length === 0) {
    return (
      <Container className="py-5">
        <h1>Finalizar compra</h1>
        <div className="alert alert-light border">No hay productos en tu carrito.</div>
        <Link to="/productos" className="btn btn-primary">Ver productos</Link>
      </Container>
    );
  }

  const total = calcularTotal(lineas);

  return (
    <Container className="py-4">
      <h1 className="mb-3">Finalizar compra</h1>
      {errorServidor && <div className="alert alert-danger" role="alert">{errorServidor}</div>}
      <Row className="g-4">
        <Col xs={12} lg={7}>
          <Form noValidate onSubmit={pagar} aria-label="Formulario de compra">
            <h2 className="h5">Información del cliente</h2>
            <Row>
              <Col xs={12} md={6}><CampoFormulario id="checkout-nombre" etiqueta="Nombre" name="nombre" autoComplete="given-name" valor={datos.nombre} error={errores.nombre} onChange={cambiar} /></Col>
              <Col xs={12} md={6}><CampoFormulario id="checkout-apellidos" etiqueta="Apellidos" name="apellidos" autoComplete="family-name" valor={datos.apellidos} error={errores.apellidos} onChange={cambiar} /></Col>
            </Row>
            <CampoFormulario id="checkout-correo" etiqueta="Correo" name="correo" tipo="email" autoComplete="email" valor={datos.correo} error={errores.correo} onChange={cambiar} />

            <h2 className="h5 mt-2">Entrega</h2>
            <fieldset className="mb-3">
              <legend className="visually-hidden">Forma de entrega</legend>
              {OPCIONES_ENTREGA.map((opcion) => (
                <div className="form-check" key={opcion.id}>
                  <input
                    className="form-check-input"
                    type="radio"
                    id={`entrega-${opcion.id}`}
                    name="entrega"
                    value={opcion.id}
                    checked={datos.entrega === opcion.id}
                    onChange={cambiar}
                  />
                  <label className="form-check-label" htmlFor={`entrega-${opcion.id}`}>{opcion.etiqueta}</label>
                </div>
              ))}
            </fieldset>

            {requiereDireccion(datos.entrega) && (
              <>
                <h2 className="h5">Dirección de entrega</h2>
                <Row>
                  <Col xs={12} md={8}><CampoFormulario id="checkout-calle" etiqueta="Calle y número" name="calle" autoComplete="street-address" valor={datos.calle} error={errores.calle} onChange={cambiar} /></Col>
                  <Col xs={12} md={4}><CampoFormulario id="checkout-departamento" etiqueta="Departamento (opcional)" name="departamento" valor={datos.departamento} error={errores.departamento} onChange={cambiar} /></Col>
                </Row>
                <CampoRegionComuna
                  prefijo="checkout"
                  region={datos.region}
                  comuna={datos.comuna}
                  errorRegion={errores.region}
                  errorComuna={errores.comuna}
                  onCambiar={(cambios) => setDatos({ ...datos, ...cambios })}
                />
                <CampoFormulario id="checkout-indicaciones" etiqueta="Indicaciones para la entrega (opcional)" name="indicaciones" como="textarea" filas={3} valor={datos.indicaciones} error={errores.indicaciones} onChange={cambiar} />
              </>
            )}

            <h2 className="h5 mt-2">Pago</h2>
            <Form.Group className="mb-4" controlId="checkout-resultado">
              <Form.Label>Resultado del pago (simulación)</Form.Label>
              <select id="checkout-resultado" className="form-select" value={resultadoPago} onChange={(evento) => setResultadoPago(evento.target.value)}>
                <option value="aprobado">Pago aprobado</option>
                <option value="rechazado">Pago rechazado</option>
              </select>
              <div className="form-text">Este sitio no procesa pagos reales: elige qué resultado quieres simular.</div>
            </Form.Group>

            <Button type="submit" variant="primary" size="lg" disabled={enviando}>{enviando ? "Procesando..." : `Pagar ahora ${formatearCLP(total)}`}</Button>
          </Form>
        </Col>
        <Col xs={12} lg={5}>
          <div className="card">
            <div className="card-body">
              <h2 className="h5">Tu pedido</h2>
              <TablaItems items={lineas} total={total} />
              <Link to="/carrito">Modificar carrito</Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Checkout;
