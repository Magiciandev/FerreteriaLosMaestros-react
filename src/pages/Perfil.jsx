import { useState } from "react";
import { Alert, Button, Container } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import CampoFormulario from "../components/CampoFormulario";
import CampoRegionComuna from "../components/CampoRegionComuna";
import { useFormulario } from "../hooks/useFormulario";
import { validarApellidos, validarComuna, validarDireccion, validarNombre, validarRegion } from "../utils/validaciones";

const VALIDADORES = {
  nombre: validarNombre,
  apellidos: validarApellidos,
  region: validarRegion,
  comuna: validarComuna,
  direccion: validarDireccion,
};

const datosEditables = (usuario) => ({
  nombre: usuario?.nombre ?? "",
  apellidos: usuario?.apellidos ?? "",
  region: usuario?.region ?? "",
  comuna: usuario?.comuna ?? "",
  direccion: usuario?.direccion ?? "",
});

// Perfil de la persona con sesión iniciada: muestra sus datos y, si es cliente, permite
// editar nombre, apellidos y dirección. Los empleados se administran desde el panel.
// Props:
//   usuario    el registro completo del usuario (la sesión solo lleva algunos datos)
//   onGuardar  función (cambios) que guarda los cambios
// Estado propio: si se está editando, si se acaba de guardar y los campos (useFormulario).
function Perfil({ usuario, onGuardar }) {
  const ubicacion = useLocation();
  const [editando, setEditando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const formulario = useFormulario(datosEditables(usuario), VALIDADORES);

  if (!usuario) {
    return (
      <Container className="py-5">
        <h1>Mi perfil</h1>
        <p className="text-secondary">No encontramos los datos de tu cuenta.</p>
      </Container>
    );
  }

  const esCliente = usuario.tipo === "cliente";
  const ficha = [
    ["Nombre", `${usuario.nombre} ${usuario.apellidos}`],
    ["Correo", usuario.correo],
    ["RUN", usuario.run],
    ["Tipo de cuenta", usuario.rol],
    ["Tipo de cliente", usuario.tipoCliente],
    ["Región", usuario.region],
    ["Comuna", usuario.comuna],
    ["Dirección", usuario.direccion],
  ];

  function empezarEdicion() {
    formulario.reiniciar();
    setGuardado(false);
    setEditando(true);
  }

  function guardar(evento) {
    evento.preventDefault();
    if (!formulario.validarTodo()) return;
    onGuardar(formulario.datos);
    setEditando(false);
    setGuardado(true);
  }

  return (
    <Container className="py-4">
      <h1 className="mb-3">Mi perfil</h1>
      {ubicacion.state?.nuevaCuenta && <Alert variant="success" role="status">Tu cuenta fue creada y ya iniciaste sesión.</Alert>}
      {guardado && <Alert variant="success" role="status">Datos actualizados.</Alert>}

      {editando ? (
        <form noValidate onSubmit={guardar} aria-label="Editar mis datos" className="formulario-perfil">
          <CampoFormulario id="perfil-nombre" etiqueta="Nombre" {...formulario.campo("nombre")} />
          <CampoFormulario id="perfil-apellidos" etiqueta="Apellidos" {...formulario.campo("apellidos")} />
          <CampoRegionComuna
            prefijo="perfil"
            region={formulario.datos.region}
            comuna={formulario.datos.comuna}
            errorRegion={formulario.errores.region}
            errorComuna={formulario.errores.comuna}
            onCambiar={formulario.establecer}
          />
          <CampoFormulario id="perfil-direccion" etiqueta="Dirección" {...formulario.campo("direccion")} />
          <div className="d-flex gap-2">
            <Button type="submit" variant="primary">Guardar cambios</Button>
            <Button variant="outline-secondary" onClick={() => setEditando(false)}>Cancelar</Button>
          </div>
        </form>
      ) : (
        <>
          <dl className="row">
            {ficha.filter(([, valor]) => valor).map(([etiqueta, valor]) => (
              <div className="col-12 row mb-2" key={etiqueta}>
                <dt className="col-5 col-md-3">{etiqueta}</dt>
                <dd className="col-7 col-md-9 mb-0">{valor}</dd>
              </div>
            ))}
          </dl>
          {esCliente ? (
            <Button variant="primary" onClick={empezarEdicion}>Editar mis datos</Button>
          ) : (
            <p className="text-secondary">Los datos del personal se administran desde el panel de administración.</p>
          )}
        </>
      )}
    </Container>
  );
}

export default Perfil;
