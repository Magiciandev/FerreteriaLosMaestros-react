import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ROLES, etiquetaRol } from "../../utils/validaciones";

// Listado de usuarios del sistema (solo Administrador): buscador, filtro por rol, y acciones
// para ver, editar y eliminar.
// Props:
//   usuarios    -> arreglo de usuarios de la base de datos simulada
//   onEliminar  -> función que recibe el id del usuario y lo borra
// Estado propio: buscador, rol elegido y mensaje de resultado.
function AdminUsuarios({ usuarios, onEliminar }) {
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [texto, setTexto] = useState("");
  const [rol, setRol] = useState("");

  // Busca por nombre, apellidos, correo o RUN, sin distinguir mayúsculas.
  const buscado = texto.trim().toLowerCase();
  const visibles = usuarios.filter((usuario) => {
    const datos = `${usuario.nombre} ${usuario.apellidos} ${usuario.correo} ${usuario.run ?? ""}`.toLowerCase();
    return (rol === "" || usuario.rol === rol) && datos.includes(buscado);
  });

  // Pide confirmación con el cuadro del navegador antes de borrar.
  async function eliminar(usuario) {
    if (!window.confirm(`¿Seguro que quieres eliminar a ${usuario.nombre} ${usuario.apellidos} (${usuario.correo})? Esta acción no se puede deshacer.`)) return;
    setError("");
    try {
      await onEliminar(usuario.id);
      setMensaje(`El usuario "${usuario.nombre} ${usuario.apellidos}" se eliminó.`);
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  return (
    <section aria-labelledby="titulo-admin-usuarios">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 id="titulo-admin-usuarios" className="h3 mb-0">Usuarios</h1>
        <Link to="/admin/usuarios/nuevo" className="btn btn-primary">Nuevo usuario</Link>
      </div>

      {mensaje && <div className="alert alert-success" role="status">{mensaje}</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <Row className="g-3 mb-3">
        <Col xs={12} md={7}>
          <Form.Group controlId="admin-usuarios-buscar">
            <Form.Label>Buscar</Form.Label>
            <Form.Control
              type="search"
              value={texto}
              placeholder="Nombre, correo o RUN"
              onChange={(evento) => setTexto(evento.target.value)}
              autoComplete="off"
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={5}>
          <Form.Group controlId="admin-usuarios-rol">
            <Form.Label>Rol</Form.Label>
            <select id="admin-usuarios-rol" className="form-select" value={rol} onChange={(evento) => setRol(evento.target.value)}>
              <option value="">Todos</option>
              {ROLES.map((nombre) => (
                <option key={nombre} value={nombre}>{etiquetaRol(nombre)}</option>
              ))}
            </select>
          </Form.Group>
        </Col>
      </Row>

      <p className="small text-secondary" role="status">{visibles.length} de {usuarios.length} usuarios</p>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>RUN</th>
              <th>Rol</th>
              <th><span className="visually-hidden">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-secondary py-4">Ningún usuario coincide con la búsqueda.</td>
              </tr>
            )}
            {visibles.map((usuario) => {
              return (
                <tr key={usuario.id}>
                  <td>
                    <Link to={`/admin/usuarios/${usuario.id}`}>{usuario.nombre} {usuario.apellidos}</Link>
                  </td>
                  <td>{usuario.correo}</td>
                  <td>{usuario.run ?? "—"}</td>
                  <td>{etiquetaRol(usuario.rol)}</td>
                  <td className="text-end text-nowrap">
                    <Link
                      to={`/admin/usuarios/${usuario.id}`}
                      className="btn btn-sm btn-outline-dark me-2"
                      aria-label={`Ver ${usuario.nombre} ${usuario.apellidos}`}
                    >
                      Ver
                    </Link>
                    <Link
                      to={`/admin/usuarios/${usuario.id}/editar`}
                      className="btn btn-sm btn-outline-dark me-2"
                      aria-label={`Editar ${usuario.nombre} ${usuario.apellidos}`}
                    >
                      Editar
                    </Link>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      aria-label={`Eliminar ${usuario.nombre} ${usuario.apellidos}`}
                      onClick={() => eliminar(usuario)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </section>
  );
}

export default AdminUsuarios;