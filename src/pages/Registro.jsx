import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import CampoFormulario from "../components/CampoFormulario";
import CampoRegionComuna from "../components/CampoRegionComuna";
import { useFormulario } from "../hooks/useFormulario";
import {
  validarApellidos, validarComuna, validarCorreo, validarDireccion, validarFechaNacimiento,
  validarNombre, validarPassword, validarPasswordConfirmar, validarRegion, validarRun, validarTipoCliente,
} from "../utils/validaciones";

const VACIO = {
  run: "", nombre: "", apellidos: "", correo: "", fechaNacimiento: "", tipoCliente: "",
  region: "", comuna: "", direccion: "", password: "", confirmar: "",
};

// Cada campo con su regla (funciones de utils/validaciones.js). El de confirmar recibe también
// todos los valores para comparar con la contraseña.
const VALIDADORES = {
  run: validarRun,
  nombre: validarNombre,
  apellidos: validarApellidos,
  correo: validarCorreo,
  fechaNacimiento: validarFechaNacimiento,
  tipoCliente: validarTipoCliente,
  region: validarRegion,
  comuna: validarComuna,
  direccion: validarDireccion,
  password: validarPassword,
  confirmar: (valor, todos) => validarPasswordConfirmar(valor, todos.password),
};

// Registro de clientes.
// Props:
//   sesion       sesión actual; si ya hay una, se redirige al inicio
//   onRegistrar  función (datos) que crea la cuenta y devuelve { ok: true } o
//                { ok: false, campo, error } (por ejemplo, correo repetido)
// Al terminar bien, la cuenta queda con la sesión iniciada y se lleva al perfil.
function Registro({ sesion, onRegistrar }) {
  const formulario = useFormulario(VACIO, VALIDADORES);
  const [creada, setCreada] = useState(false);

  if (creada) return <Navigate to="/perfil" replace state={{ nuevaCuenta: true }} />;
  if (sesion) return <Navigate to="/" replace />;

  function enviar(evento) {
    evento.preventDefault();
    if (!formulario.validarTodo()) return;
    // La confirmación de la contraseña solo sirve para validar; no se guarda.
    const datos = { ...formulario.datos };
    delete datos.confirmar;
    const resultado = onRegistrar(datos);
    if (resultado.ok) setCreada(true);
    else formulario.ponerError(resultado.campo, resultado.error);
  }

  const { datos, errores } = formulario;

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={9}>
          <Card>
            <Card.Body className="p-4">
              <h1 className="h3 mb-1">Crear cuenta</h1>
              <p className="text-secondary">Todos los datos son obligatorios, salvo la fecha de nacimiento.</p>
              <Form noValidate onSubmit={enviar} aria-label="Formulario de registro">
                <Row>
                  <Col xs={12} md={6}>
                    <CampoFormulario id="registro-run" etiqueta="RUN" ayuda="Sin puntos ni guion, por ejemplo 12345678K." {...formulario.campo("run")} />
                  </Col>
                  <Col xs={12} md={6}>
                    <CampoFormulario id="registro-fecha" etiqueta="Fecha de nacimiento (opcional)" tipo="date" {...formulario.campo("fechaNacimiento")} />
                  </Col>
                  <Col xs={12} md={6}>
                    <CampoFormulario id="registro-nombre" etiqueta="Nombre" autoComplete="given-name" {...formulario.campo("nombre")} />
                  </Col>
                  <Col xs={12} md={6}>
                    <CampoFormulario id="registro-apellidos" etiqueta="Apellidos" autoComplete="family-name" {...formulario.campo("apellidos")} />
                  </Col>
                </Row>
                <CampoFormulario id="registro-correo" etiqueta="Correo" tipo="email" autoComplete="email" ayuda="Se aceptan correos @duoc.cl, @profesor.duoc.cl y @gmail.com." {...formulario.campo("correo")} />

                <fieldset className="mb-3">
                  <legend className="form-label fs-6">Tipo de cliente</legend>
                  <Form.Check
                    inline type="radio" id="tipo-particular" name="tipoCliente" label="Particular" value="particular"
                    checked={datos.tipoCliente === "particular"}
                    onChange={(evento) => formulario.cambiar("tipoCliente", evento.target.value)}
                  />
                  <Form.Check
                    inline type="radio" id="tipo-contratista" name="tipoCliente" label="Contratista" value="contratista"
                    checked={datos.tipoCliente === "contratista"}
                    onChange={(evento) => formulario.cambiar("tipoCliente", evento.target.value)}
                  />
                  {errores.tipoCliente && <div className="text-danger small mt-1" role="alert">{errores.tipoCliente}</div>}
                </fieldset>

                <CampoRegionComuna
                  prefijo="registro"
                  region={datos.region}
                  comuna={datos.comuna}
                  errorRegion={errores.region}
                  errorComuna={errores.comuna}
                  onCambiar={formulario.establecer}
                />
                <CampoFormulario id="registro-direccion" etiqueta="Dirección" autoComplete="street-address" {...formulario.campo("direccion")} />

                <Row>
                  <Col xs={12} md={6}>
                    <CampoFormulario id="registro-password" etiqueta="Contraseña" tipo="password" autoComplete="new-password" ayuda="Entre 4 y 10 caracteres." {...formulario.campo("password")} />
                  </Col>
                  <Col xs={12} md={6}>
                    <CampoFormulario id="registro-confirmar" etiqueta="Confirmar contraseña" tipo="password" autoComplete="new-password" {...formulario.campo("confirmar")} />
                  </Col>
                </Row>

                {Object.values(errores).some(Boolean) && (
                  <Alert variant="danger" className="py-2">Revisa los campos marcados antes de continuar.</Alert>
                )}
                <Button type="submit" variant="primary">Crear cuenta</Button>
              </Form>
              <p className="mt-3 mb-0">
                ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Registro;
