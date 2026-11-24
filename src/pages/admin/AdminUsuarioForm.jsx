import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import CampoFormulario from "../../components/CampoFormulario";
import CampoRegionComuna from "../../components/CampoRegionComuna";
import {
  ROLES,
  etiquetaRol,
  validarApellidos,
  validarComuna,
  validarCorreo,
  validarDireccion,
  validarFechaNacimiento,
  validarNombre,
  validarPassword,
  validarRegion,
  validarRol,
  validarRun,
  validarTipoCliente,
} from "../../utils/validaciones";

const esCliente = (datos) => datos.rol === "CLIENTE";

// Los campos guardan siempre texto; lo que falta se precarga vacío.
function valoresIniciales(usuario) {
  return {
    run: usuario?.run ?? "",
    nombre: usuario?.nombre ?? "",
    apellidos: usuario?.apellidos ?? "",
    correo: usuario?.correo ?? "",
    rol: usuario?.rol ?? "",
    fechaNacimiento: usuario?.fechaNacimiento ?? "",
    tipoCliente: usuario?.tipoCliente ?? "",
    region: usuario?.region ?? "",
    comuna: usuario?.comuna ?? "",
    direccion: usuario?.direccion ?? "",
    password: "",
  };
}

// Revisa los datos y devuelve un error (o "") por campo. Los datos propios de un cliente (tipo,
// región, comuna, dirección) solo se exigen cuando el rol elegido es Cliente.
function validar(datos, editando) {
  const cliente = esCliente(datos);
  return {
    // El RUN es obligatorio para clientes; el personal puede no tenerlo (los usuarios iniciales
    // no lo tienen), pero si se escribe debe ser válido.
    run: cliente || datos.run.trim() !== "" ? validarRun(datos.run) : "",
    nombre: validarNombre(datos.nombre),
    apellidos: validarApellidos(datos.apellidos),
    correo: validarCorreo(datos.correo),
    rol: validarRol(datos.rol),
    fechaNacimiento: validarFechaNacimiento(datos.fechaNacimiento),
    tipoCliente: cliente ? validarTipoCliente(datos.tipoCliente) : "",
    region: cliente ? validarRegion(datos.region) : "",
    comuna: cliente ? validarComuna(datos.comuna) : "",
    direccion: cliente ? validarDireccion(datos.direccion) : "",
    // Al editar, dejar la contraseña vacía significa "no cambiarla".
    password: editando && datos.password === "" ? "" : validarPassword(datos.password),
  };
}

// Formulario en sí. Está separado del componente de abajo para que React lo arme de nuevo (y
// vuelva a precargar los campos) cuando cambia el usuario: ver "key" más abajo.
function FormularioUsuario({ usuario, onCrear, onActualizar }) {
  const editando = Boolean(usuario);
  const [datos, setDatos] = useState(valoresIniciales(usuario));
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [errorServidor, setErrorServidor] = useState("");
  const [guardando, setGuardando] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
    setMensaje("");
  }

  async function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = validar(datos, editando);
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;

    // Los datos de cliente se envían solo si el rol es Cliente; en otro caso van null, así no
    // queda información vieja al cambiar de rol. El servidor revisa que el correo y el RUN no
    // pertenezcan a otra cuenta y, si es así, se muestra su mensaje.
    const cliente = esCliente(datos);
    const cambios = {
      rol: datos.rol,
      run: datos.run.trim() === "" ? null : datos.run.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo.trim().toLowerCase(),
      fechaNacimiento: cliente && datos.fechaNacimiento ? datos.fechaNacimiento : null,
      tipoCliente: cliente ? datos.tipoCliente : null,
      region: cliente ? datos.region : null,
      comuna: cliente ? datos.comuna : null,
      direccion: cliente ? datos.direccion.trim() : null,
    };
    if (datos.password !== "") cambios.password = datos.password;

    setGuardando(true);
    setErrorServidor("");
    try {
      if (editando) await onActualizar(usuario.id, cambios);
      else await onCrear(cambios);
      setMensaje(`El usuario "${cambios.nombre} ${cambios.apellidos}" se ${editando ? "actualizó" : "creó"}.`);
      if (!editando) setDatos(valoresIniciales(null));
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section aria-labelledby="titulo-admin-usuario-form">
      <h1 id="titulo-admin-usuario-form" className="h3 mb-3">{editando ? "Editar usuario" : "Nuevo usuario"}</h1>
      {mensaje && (
        <div className="alert alert-success" role="status">
          {mensaje} <Link to="/admin/usuarios" className="alert-link">Volver al listado</Link>
        </div>
      )}
      {errorServidor && <div className="alert alert-danger" role="alert">{errorServidor}</div>}
      <Form noValidate onSubmit={enviar} aria-label="Formulario de usuario" style={{ maxWidth: "48rem" }}>
        <Row>
          <Col xs={12} md={6}>
            <CampoFormulario id="usuario-nombre" etiqueta="Nombre" autoComplete="off" name="nombre" valor={datos.nombre} error={errores.nombre} onChange={cambiar} />
          </Col>
          <Col xs={12} md={6}>
            <CampoFormulario id="usuario-apellidos" etiqueta="Apellidos" autoComplete="off" name="apellidos" valor={datos.apellidos} error={errores.apellidos} onChange={cambiar} />
          </Col>
          <Col xs={12} md={6}>
            <CampoFormulario
              id="usuario-run"
              etiqueta={esCliente(datos) ? "RUN" : "RUN (opcional)"}
              ayuda="Sin puntos ni guion, por ejemplo 12345678K."
              autoComplete="off"
              name="run" valor={datos.run} error={errores.run} onChange={cambiar}
            />
          </Col>
          <Col xs={12} md={6}>
            <CampoFormulario
              id="usuario-correo"
              etiqueta="Correo"
              tipo="email"
              ayuda="Se aceptan correos @duoc.cl, @profesor.duoc.cl y @gmail.com."
              autoComplete="off"
              name="correo" valor={datos.correo} error={errores.correo} onChange={cambiar}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3" controlId="usuario-rol">
              <Form.Label>Rol</Form.Label>
              <select
                id="usuario-rol"
                name="rol"
                className={`form-select${errores.rol ? " is-invalid" : ""}`}
                value={datos.rol}
                onChange={cambiar}
                aria-describedby={errores.rol ? "usuario-rol-error" : undefined}
              >
                <option value="">Selecciona un rol</option>
                {ROLES.map((nombre) => (
                  <option key={nombre} value={nombre}>{etiquetaRol(nombre)}</option>
                ))}
              </select>
              <Form.Control.Feedback type="invalid" id="usuario-rol-error">{errores.rol}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <CampoFormulario
              id="usuario-password"
              etiqueta={editando ? "Contraseña nueva (opcional)" : "Contraseña"}
              tipo="password"
              ayuda={editando ? "Déjala vacía para conservar la actual. Entre 4 y 10 caracteres." : "Entre 4 y 10 caracteres."}
              autoComplete="new-password"
              name="password" valor={datos.password} error={errores.password} onChange={cambiar}
            />
          </Col>
        </Row>

        {/* Datos propios de un cliente: solo aparecen cuando el rol elegido es Cliente. */}
        {esCliente(datos) && (
          <>
            <CampoFormulario id="usuario-fecha" etiqueta="Fecha de nacimiento (opcional)" tipo="date" name="fechaNacimiento" valor={datos.fechaNacimiento} error={errores.fechaNacimiento} onChange={cambiar} />

            <fieldset className="mb-3">
              <legend className="form-label fs-6">Tipo de cliente</legend>
              {["particular", "contratista"].map((tipo) => (
                <div className="form-check form-check-inline" key={tipo}>
                  <input
                    className="form-check-input"
                    type="radio"
                    id={`usuario-tipo-${tipo}`}
                    name="tipoCliente"
                    value={tipo}
                    checked={datos.tipoCliente === tipo}
                    onChange={cambiar}
                  />
                  <label className="form-check-label" htmlFor={`usuario-tipo-${tipo}`}>
                    {tipo === "particular" ? "Particular" : "Contratista"}
                  </label>
                </div>
              ))}
              {errores.tipoCliente && <div className="text-danger small mt-1" role="alert">{errores.tipoCliente}</div>}
            </fieldset>

            <CampoRegionComuna
              prefijo="usuario"
              region={datos.region}
              comuna={datos.comuna}
              errorRegion={errores.region}
              errorComuna={errores.comuna}
              onCambiar={(cambios) => setDatos({ ...datos, ...cambios })}
            />
            <CampoFormulario id="usuario-direccion" etiqueta="Dirección" autoComplete="off" name="direccion" valor={datos.direccion} error={errores.direccion} onChange={cambiar} />
          </>
        )}

        {Object.values(errores).some(Boolean) && (
          <div className="alert alert-danger py-2">Revisa los campos marcados antes de continuar.</div>
        )}
        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" disabled={guardando}>{guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear usuario"}</Button>
          <Link to="/admin/usuarios" className="btn btn-outline-secondary">Cancelar</Link>
        </div>
      </Form>
    </section>
  );
}

// Formulario de usuario, compartido por dos rutas (solo Administrador):
//   /admin/usuarios/nuevo         -> crea un usuario
//   /admin/usuarios/:id/editar    -> edita uno existente
// Si la dirección trae :id (useParams) está en modo edición; si no, en modo creación.
// Props:
//   usuarios      -> arreglo de usuarios (para precargar los datos al editar)
//   onCrear       -> recibe el usuario completo y lo guarda (devuelve una promesa)
//   onActualizar  -> recibe (id, cambios) y guarda los cambios (devuelve una promesa)
// Estado propio: los valores, los errores y el mensaje de guardado. Al guardar no se cambia de
// página: se muestra un mensaje con un enlace para volver al listado.
function AdminUsuarioForm({ usuarios, onCrear, onActualizar }) {
  const { id } = useParams();
  const usuario = id ? usuarios.find((actual) => String(actual.id) === id) : null;

  if (id && !usuario) {
    return (
      <section>
        <div className="alert alert-warning">
          No encontramos al usuario "{id}". <Link to="/admin/usuarios" className="alert-link">Volver al listado</Link>
        </div>
      </section>
    );
  }

  // key: useState toma los valores iniciales solo la primera vez; con una key distinta por
  // usuario, React arma un formulario nuevo con los datos del otro.
  return (
    <FormularioUsuario
      key={id ?? "nuevo"}
      usuario={usuario}
      onCrear={onCrear}
      onActualizar={onActualizar}
    />
  );
}

export default AdminUsuarioForm;