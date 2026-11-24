import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import CampoFormulario from "../components/CampoFormulario";
import CampoRegionComuna from "../components/CampoRegionComuna";
import {
  validarApellidos, validarComuna, validarCorreo, validarDireccion, validarFechaNacimiento,
  validarNombre, validarPassword, validarPasswordConfirmar, validarRegion, validarRun, validarTipoCliente,
} from "../utils/validaciones";

const VACIO = {
  run: "", nombre: "", apellidos: "", correo: "", fechaNacimiento: "", tipoCliente: "",
  region: "", comuna: "", direccion: "", password: "", confirmar: "",
};

const TIPOS_CLIENTE = [
  { id: "particular", etiqueta: "Particular" },
  { id: "contratista", etiqueta: "Contratista" },
];

// Revisa los datos del formulario y devuelve un error (o "") por campo.
// El de confirmar se compara con la contraseña.
function validar(datos) {
  return {
    run: validarRun(datos.run),
    nombre: validarNombre(datos.nombre),
    apellidos: validarApellidos(datos.apellidos),
    correo: validarCorreo(datos.correo),
    fechaNacimiento: validarFechaNacimiento(datos.fechaNacimiento),
    tipoCliente: validarTipoCliente(datos.tipoCliente),
    region: validarRegion(datos.region),
    comuna: validarComuna(datos.comuna),
    direccion: validarDireccion(datos.direccion),
    password: validarPassword(datos.password),
    confirmar: validarPasswordConfirmar(datos.confirmar, datos.password),
  };
}

// Registro de clientes.
// Prop: onRegistrar, función (datos) que crea la cuenta en el servidor (devuelve una promesa que
//       falla con un mensaje si, por ejemplo, el correo o el RUN ya existen).
// Al terminar bien se muestra un mensaje de confirmación con un enlace para iniciar sesión.
// Estado propio: los datos escritos, los errores, si la cuenta se creó, el mensaje del servidor y
// si se está enviando.
function Registro({ onRegistrar }) {
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [creada, setCreada] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
    setCreada(false);
  }

  async function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = validar(datos);
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;

    // Se envía lo que el servidor espera: textos sin espacios sobrantes, correo en minúsculas, RUN
    // en mayúsculas y la fecha de nacimiento null si se dejó vacía. La confirmación de la
    // contraseña solo sirve para validar; no se envía.
    const cuenta = {
      run: datos.run.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo.trim().toLowerCase(),
      fechaNacimiento: datos.fechaNacimiento || null,
      tipoCliente: datos.tipoCliente,
      region: datos.region,
      comuna: datos.comuna,
      direccion: datos.direccion.trim(),
      password: datos.password,
    };
    setEnviando(true);
    setErrorServidor("");
    try {
      await onRegistrar(cuenta);
      setDatos(VACIO);
      setCreada(true);
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={9}>
          <div className="card">
            <div className="card-body p-4">
              <h1 className="h3 mb-1">Crear cuenta</h1>
              <p className="text-secondary">Todos los datos son obligatorios, salvo la fecha de nacimiento.</p>
              {creada && (
                <div className="alert alert-success" role="status">
                  Cuenta creada. Ya puedes <Link to="/login" className="alert-link">iniciar sesión</Link>.
                </div>
              )}
              {errorServidor && <div className="alert alert-danger" role="alert">{errorServidor}</div>}
              <Form noValidate onSubmit={enviar} aria-label="Formulario de registro">
                <Row>
                  <Col xs={12} md={6}>
                    <CampoFormulario id="registro-run" etiqueta="RUN" name="run" ayuda="Sin puntos ni guion, por ejemplo 12345678K." valor={datos.run} error={errores.run} onChange={cambiar} />
                  </Col>
                  <Col xs={12} md={6}>
                    <CampoFormulario id="registro-fecha" etiqueta="Fecha de nacimiento (opcional)" name="fechaNacimiento" tipo="date" valor={datos.fechaNacimiento} error={errores.fechaNacimiento} onChange={cambiar} />
                  </Col>
                  <Col xs={12} md={6}>
                    <CampoFormulario id="registro-nombre" etiqueta="Nombre" name="nombre" autoComplete="given-name" valor={datos.nombre} error={errores.nombre} onChange={cambiar} />
                  </Col>
                  <Col xs={12} md={6}>
                    <CampoFormulario id="registro-apellidos" etiqueta="Apellidos" name="apellidos" autoComplete="family-name" valor={datos.apellidos} error={errores.apellidos} onChange={cambiar} />
                  </Col>
                </Row>
                <CampoFormulario id="registro-correo" etiqueta="Correo" name="correo" tipo="email" autoComplete="email" ayuda="Se aceptan correos @duoc.cl, @profesor.duoc.cl y @gmail.com." valor={datos.correo} error={errores.correo} onChange={cambiar} />

                <fieldset className="mb-3">
                  <legend className="form-label fs-6">Tipo de cliente</legend>
                  {TIPOS_CLIENTE.map((tipo) => (
                    <div className="form-check form-check-inline" key={tipo.id}>
                      <input
                        className="form-check-input"
                        type="radio"
                        id={`tipo-${tipo.id}`}
                        name="tipoCliente"
                        value={tipo.id}
                        checked={datos.tipoCliente === tipo.id}
                        onChange={cambiar}
                      />
                      <label className="form-check-label" htmlFor={`tipo-${tipo.id}`}>{tipo.etiqueta}</label>
                    </div>
                  ))}
                  {errores.tipoCliente && <div className="text-danger small mt-1" role="alert">{errores.tipoCliente}</div>}
                </fieldset>

                <CampoRegionComuna
                  prefijo="registro"
                  region={datos.region}
                  comuna={datos.comuna}
                  errorRegion={errores.region}
                  errorComuna={errores.comuna}
                  onCambiar={(cambios) => setDatos({ ...datos, ...cambios })}
                />
                <CampoFormulario id="registro-direccion" etiqueta="Dirección" name="direccion" autoComplete="street-address" valor={datos.direccion} error={errores.direccion} onChange={cambiar} />

                <Row>
                  <Col xs={12} md={6}>
                    <CampoFormulario id="registro-password" etiqueta="Contraseña" name="password" tipo="password" autoComplete="new-password" ayuda="Entre 4 y 10 caracteres." valor={datos.password} error={errores.password} onChange={cambiar} />
                  </Col>
                  <Col xs={12} md={6}>
                    <CampoFormulario id="registro-confirmar" etiqueta="Confirmar contraseña" name="confirmar" tipo="password" autoComplete="new-password" valor={datos.confirmar} error={errores.confirmar} onChange={cambiar} />
                  </Col>
                </Row>

                {Object.values(errores).some(Boolean) && (
                  <div className="alert alert-danger py-2" role="alert">Revisa los campos marcados antes de continuar.</div>
                )}
                <Button type="submit" variant="primary" disabled={enviando}>{enviando ? "Creando..." : "Crear cuenta"}</Button>
              </Form>
              <p className="mt-3 mb-0">
                ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Registro;
