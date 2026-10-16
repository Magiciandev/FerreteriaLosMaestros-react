import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import CampoFormulario from "../../components/CampoFormulario";
import CampoRegionComuna from "../../components/CampoRegionComuna";
import { useFormulario } from "../../hooks/useFormulario";
import { encontrarDuplicado } from "../../services/autenticacion";
import {
  ROLES,
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

const esCliente = (datos) => datos.rol === "Cliente";

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

// Los validadores reciben el valor del campo y, como segundo parámetro, todos los valores del
// formulario (useFormulario lo hace así). Con eso, los datos propios de un cliente (tipo,
// región, comuna, dirección) solo se exigen cuando el rol elegido es Cliente.
function crearValidadores(editando) {
  const soloCliente = (validador) => (valor, datos) => (esCliente(datos) ? validador(valor) : "");
  return {
    // El RUN es obligatorio para clientes; el personal puede no tenerlo (los usuarios iniciales
    // no lo tienen), pero si se escribe debe ser válido.
    run: (valor, datos) => (esCliente(datos) || valor.trim() !== "" ? validarRun(valor) : ""),
    nombre: validarNombre,
    apellidos: validarApellidos,
    correo: validarCorreo,
    rol: validarRol,
    fechaNacimiento: validarFechaNacimiento,
    tipoCliente: soloCliente(validarTipoCliente),
    region: soloCliente(validarRegion),
    comuna: soloCliente(validarComuna),
    direccion: soloCliente(validarDireccion),
    // Al editar, dejar la contraseña vacía significa "no cambiarla".
    password: (valor) => (editando && valor === "" ? "" : validarPassword(valor)),
  };
}

// Formulario en sí. Está separado del componente de abajo para que React lo arme de nuevo (y
// vuelva a precargar los campos) cuando cambia el usuario: ver "key" más abajo.
function FormularioUsuario({ usuario, usuarios, sesion, onCrear, onActualizar }) {
  const navigate = useNavigate();
  const editando = Boolean(usuario);
  // Quien edita su propia cuenta no puede cambiarse el rol: podría quitarse el acceso al panel.
  const esCuentaPropia = editando && usuario.id === sesion?.id;

  const formulario = useFormulario(valoresIniciales(usuario), crearValidadores(editando));
  const { datos, errores } = formulario;
  const campoRol = formulario.campo("rol");

  function enviar(evento) {
    evento.preventDefault();
    if (!formulario.validarTodo()) return;

    // El correo y el RUN no pueden pertenecer a otra cuenta (se ignora la propia al editar).
    const duplicado = encontrarDuplicado(usuarios, { correo: datos.correo, run: datos.run, idActual: usuario?.id });
    if (duplicado) {
      formulario.ponerError(duplicado.campo, duplicado.error);
      return;
    }

    // El tipo de cuenta se deduce del rol. Los datos de cliente se guardan solo si el rol es
    // Cliente; en otro caso se dejan vacíos, así no queda información vieja al cambiar de rol.
    const cliente = esCliente(datos);
    const cambios = {
      rol: datos.rol,
      tipo: cliente ? "cliente" : "empleado",
      run: datos.run.trim() === "" ? null : datos.run.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo.trim().toLowerCase(),
      fechaNacimiento: cliente ? datos.fechaNacimiento : "",
      tipoCliente: cliente ? datos.tipoCliente : "",
      region: cliente ? datos.region : "",
      comuna: cliente ? datos.comuna : "",
      direccion: cliente ? datos.direccion.trim() : "",
    };
    if (datos.password !== "") cambios.password = datos.password;

    try {
      if (editando) onActualizar(usuario.id, cambios);
      else onCrear(cambios);
    } catch (error) {
      formulario.ponerError("correo", error.message);
      return;
    }
    navigate("/admin/usuarios", {
      state: { mensaje: `El usuario "${cambios.nombre} ${cambios.apellidos}" se ${editando ? "actualizó" : "creó"}.` },
    });
  }

  return (
    <section aria-labelledby="titulo-admin-usuario-form">
      <h1 id="titulo-admin-usuario-form" className="h3 mb-3">{editando ? "Editar usuario" : "Nuevo usuario"}</h1>
      <Form noValidate onSubmit={enviar} aria-label="Formulario de usuario" style={{ maxWidth: "48rem" }}>
        <Row>
          <Col xs={12} md={6}>
            <CampoFormulario id="usuario-nombre" etiqueta="Nombre" autoComplete="off" {...formulario.campo("nombre")} />
          </Col>
          <Col xs={12} md={6}>
            <CampoFormulario id="usuario-apellidos" etiqueta="Apellidos" autoComplete="off" {...formulario.campo("apellidos")} />
          </Col>
          <Col xs={12} md={6}>
            <CampoFormulario
              id="usuario-run"
              etiqueta={esCliente(datos) ? "RUN" : "RUN (opcional)"}
              ayuda="Sin puntos ni guion, por ejemplo 12345678K."
              autoComplete="off"
              {...formulario.campo("run")}
            />
          </Col>
          <Col xs={12} md={6}>
            <CampoFormulario
              id="usuario-correo"
              etiqueta="Correo"
              tipo="email"
              ayuda="Se aceptan correos @duoc.cl, @profesor.duoc.cl y @gmail.com."
              autoComplete="off"
              {...formulario.campo("correo")}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3" controlId="usuario-rol">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                value={datos.rol}
                onChange={campoRol.onChange}
                onBlur={campoRol.onBlur}
                disabled={esCuentaPropia}
                isInvalid={Boolean(errores.rol)}
                aria-describedby={errores.rol ? "usuario-rol-error" : undefined}
              >
                <option value="">Selecciona un rol</option>
                {ROLES.map((nombre) => (
                  <option key={nombre} value={nombre}>{nombre}</option>
                ))}
              </Form.Select>
              {esCuentaPropia && <Form.Text muted>No puedes cambiar el rol de tu propia cuenta.</Form.Text>}
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
              {...formulario.campo("password")}
            />
          </Col>
        </Row>

        {/* Datos propios de un cliente: solo aparecen cuando el rol elegido es Cliente. */}
        {esCliente(datos) && (
          <>
            <CampoFormulario id="usuario-fecha" etiqueta="Fecha de nacimiento (opcional)" tipo="date" {...formulario.campo("fechaNacimiento")} />

            <fieldset className="mb-3">
              <legend className="form-label fs-6">Tipo de cliente</legend>
              <Form.Check
                inline type="radio" id="usuario-tipo-particular" name="tipoCliente" label="Particular" value="particular"
                checked={datos.tipoCliente === "particular"}
                onChange={(evento) => formulario.cambiar("tipoCliente", evento.target.value)}
              />
              <Form.Check
                inline type="radio" id="usuario-tipo-contratista" name="tipoCliente" label="Contratista" value="contratista"
                checked={datos.tipoCliente === "contratista"}
                onChange={(evento) => formulario.cambiar("tipoCliente", evento.target.value)}
              />
              {errores.tipoCliente && <div className="text-danger small mt-1" role="alert">{errores.tipoCliente}</div>}
            </fieldset>

            <CampoRegionComuna
              prefijo="usuario"
              region={datos.region}
              comuna={datos.comuna}
              errorRegion={errores.region}
              errorComuna={errores.comuna}
              onCambiar={formulario.establecer}
            />
            <CampoFormulario id="usuario-direccion" etiqueta="Dirección" autoComplete="off" {...formulario.campo("direccion")} />
          </>
        )}

        {Object.values(errores).some(Boolean) && (
          <Alert variant="danger" className="py-2">Revisa los campos marcados antes de continuar.</Alert>
        )}
        <div className="d-flex gap-2">
          <Button type="submit" variant="primary">{editando ? "Guardar cambios" : "Crear usuario"}</Button>
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
//   usuarios      -> arreglo de usuarios (para precargar y detectar correos o RUN repetidos)
//   sesion        -> sesión actual (para proteger el rol de la propia cuenta)
//   onCrear       -> recibe el usuario completo y lo guarda
//   onActualizar  -> recibe (id, cambios) y guarda los cambios
// Estado propio: los valores y errores de los campos, que maneja useFormulario.
function AdminUsuarioForm({ usuarios, sesion = null, onCrear, onActualizar }) {
  const { id } = useParams();
  const usuario = id ? usuarios.find((actual) => actual.id === id) : null;

  if (id && !usuario) {
    return (
      <section>
        <Alert variant="warning">
          No encontramos al usuario "{id}". <Alert.Link as={Link} to="/admin/usuarios">Volver al listado</Alert.Link>
        </Alert>
      </section>
    );
  }

  // key: useFormulario toma los valores iniciales solo la primera vez; con una key distinta por
  // usuario, React arma un formulario nuevo con los datos del otro.
  return (
    <FormularioUsuario
      key={id ?? "nuevo"}
      usuario={usuario}
      usuarios={usuarios}
      sesion={sesion}
      onCrear={onCrear}
      onActualizar={onActualizar}
    />
  );
}

export default AdminUsuarioForm;