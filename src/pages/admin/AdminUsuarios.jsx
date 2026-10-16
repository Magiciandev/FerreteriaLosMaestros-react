import { useState } from "react";
import { Alert, Badge, Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { ROLES } from "../../utils/validaciones";

// Listado de usuarios del sistema (solo Administrador): buscador, filtro por rol, y acciones
// para ver, editar y eliminar.
// Props:
//   usuarios    -> arreglo de usuarios de la base de datos simulada
//   sesion      -> la sesión actual; sirve para impedir que el Administrador elimine su propia
//                  cuenta y quede sin acceso
//   onEliminar  -> función que recibe el id del usuario y lo borra
// Estado propio: buscador, rol elegido, usuario por eliminar (abre la confirmación) y mensaje.
function AdminUsuarios({ usuarios, sesion = null, onEliminar }) {
  const ubicacion = useLocation();
  // Si se llega desde el formulario (después de crear o editar), trae un mensaje en el estado.
  const [mensaje, setMensaje] = useState(ubicacion.state?.mensaje ?? "");
  const [texto, setTexto] = useState("");
  const [rol, setRol] = useState("");
  const [porEliminar, setPorEliminar] = useState(null);

  // Busca por nombre, apellidos, correo o RUN, sin distinguir mayúsculas.
  const buscado = texto.trim().toLowerCase();
  const visibles = usuarios.filter((usuario) => {
    const datos = `${usuario.nombre} ${usuario.apellidos} ${usuario.correo} ${usuario.run ?? ""}`.toLowerCase();
    return (rol === "" || usuario.rol === rol) && datos.includes(buscado);
  });

  function pedirConfirmacion(usuario) {
    setMensaje("");
    setPorEliminar(usuario);
  }

  function confirmarEliminacion() {
    onEliminar(porEliminar.id);
    setMensaje(`El usuario "${porEliminar.nombre} ${porEliminar.apellidos}" se eliminó.`);
    setPorEliminar(null);
  }

  return (
    <section aria-labelledby="titulo-admin-usuarios">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 id="titulo-admin-usuarios" className="h3 mb-0">Usuarios</h1>
        <Link to="/admin/usuarios/nuevo" className="btn btn-primary">Nuevo usuario</Link>
      </div>

      {mensaje && <Alert variant="success" role="status">{mensaje}</Alert>}

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
            <Form.Select value={rol} onChange={(evento) => setRol(evento.target.value)}>
              <option value="">Todos</option>
              {ROLES.map((nombre) => (
                <option key={nombre} value={nombre}>{nombre}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <p className="small text-secondary" role="status">{visibles.length} de {usuarios.length} usuarios</p>

      <Table responsive hover className="align-middle">
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
            const esPropia = usuario.id === sesion?.id;
            return (
              <tr key={usuario.id}>
                <td>
                  <Link to={`/admin/usuarios/${usuario.id}`}>{usuario.nombre} {usuario.apellidos}</Link>
                  {esPropia && <Badge bg="secondary" className="ms-2">Tú</Badge>}
                </td>
                <td>{usuario.correo}</td>
                <td>{usuario.run ?? "—"}</td>
                <td>{usuario.rol}</td>
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
                  {/* Sin botón para la cuenta propia: eliminarla dejaría la sesión sin usuario. */}
                  {!esPropia && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      aria-label={`Eliminar ${usuario.nombre} ${usuario.apellidos}`}
                      onClick={() => pedirConfirmacion(usuario)}
                    >
                      Eliminar
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <Modal
        show={Boolean(porEliminar)}
        onHide={() => setPorEliminar(null)}
        animation={false}
        centered
        aria-labelledby="titulo-eliminar-usuario"
      >
        <Modal.Header closeButton>
          <Modal.Title id="titulo-eliminar-usuario" as="h2" className="h5">Eliminar usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Seguro que quieres eliminar a <strong>{porEliminar?.nombre} {porEliminar?.apellidos}</strong> ({porEliminar?.correo})?
          Esta acción no se puede deshacer. Sus órdenes anteriores se conservan.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setPorEliminar(null)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarEliminacion}>Eliminar usuario</Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}

export default AdminUsuarios;