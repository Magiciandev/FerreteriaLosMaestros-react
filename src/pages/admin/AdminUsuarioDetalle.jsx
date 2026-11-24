import { Link, useParams } from "react-router-dom";
import { formatearFecha } from "../../utils/formato";
import { etiquetaRol } from "../../utils/validaciones";

// Ficha de un usuario (ruta /admin/usuarios/:id).
// Props:
//   usuarios  -> arreglo de usuarios; el que se muestra se busca con el :id de la URL
// La contraseña nunca se muestra. No tiene estado propio.
function AdminUsuarioDetalle({ usuarios }) {
  const { id } = useParams();
  const usuario = usuarios.find((actual) => String(actual.id) === id);

  if (!usuario) {
    return (
      <section>
        <div className="alert alert-warning">
          No encontramos al usuario "{id}". <Link to="/admin/usuarios" className="alert-link">Volver al listado</Link>
        </div>
      </section>
    );
  }

  // Pares etiqueta / valor; los vacíos (por ejemplo la dirección de un empleado) se omiten.
  const ficha = [
    ["Nombre", `${usuario.nombre} ${usuario.apellidos}`],
    ["Correo", usuario.correo],
    ["RUN", usuario.run],
    ["Rol", etiquetaRol(usuario.rol)],
    ["Tipo de cliente", usuario.tipoCliente],
    ["Fecha de nacimiento", usuario.fechaNacimiento ? formatearFecha(usuario.fechaNacimiento) : ""],
    ["Región", usuario.region],
    ["Comuna", usuario.comuna],
    ["Dirección", usuario.direccion],
  ].filter(([, valor]) => valor);

  return (
    <section aria-labelledby="titulo-admin-usuario">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 id="titulo-admin-usuario" className="h3 mb-0">{usuario.nombre} {usuario.apellidos}</h1>
        <div className="d-flex gap-2">
          <Link to="/admin/usuarios" className="btn btn-outline-secondary">Volver al listado</Link>
          <Link to={`/admin/usuarios/${usuario.id}/editar`} className="btn btn-primary">Editar usuario</Link>
        </div>
      </div>

      <dl className="mb-4">
        {ficha.map(([etiqueta, valor]) => (
          <div className="row mb-2" key={etiqueta}>
            <dt className="col-sm-3">{etiqueta}</dt>
            <dd className="col-sm-9 mb-0">{valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default AdminUsuarioDetalle;