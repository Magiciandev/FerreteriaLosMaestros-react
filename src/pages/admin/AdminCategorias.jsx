import { useState } from "react";
import { Alert, Button, Modal, Table } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

// Listado de categorías del panel de administración: tabla con la cantidad de productos de cada
// una, acceso a crear y editar, y eliminación con confirmación.
// Props:
//   categorias  -> arreglo de { slug, label }
//   productos   -> para contar cuántos usa cada categoría
//   onEliminar  -> función que recibe el slug y la borra de la base de datos simulada
// Estado propio: la categoría que se está por eliminar (abre el cuadro de confirmación) y el
// mensaje de resultado.
function AdminCategorias({ categorias, productos, onEliminar }) {
  const ubicacion = useLocation();
  // Si se llega desde el formulario (después de crear o editar), este trae un mensaje en el
  // estado de la navegación.
  const [mensaje, setMensaje] = useState(ubicacion.state?.mensaje ?? "");
  const [porEliminar, setPorEliminar] = useState(null);

  function cantidadDeProductos(slug) {
    return productos.filter((producto) => producto.categoria === slug).length;
  }

  function pedirConfirmacion(categoria) {
    setMensaje("");
    setPorEliminar(categoria);
  }

  function confirmarEliminacion() {
    onEliminar(porEliminar.slug);
    setMensaje(`La categoría "${porEliminar.label}" se eliminó.`);
    setPorEliminar(null);
  }

  return (
    <section aria-labelledby="titulo-admin-categorias">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 id="titulo-admin-categorias" className="h3 mb-0">Categorías</h1>
        <Button as={Link} to="/admin/categorias/nueva" variant="primary">Nueva categoría</Button>
      </div>

      {mensaje && <Alert variant="success" role="status">{mensaje}</Alert>}

      <Table responsive hover className="align-middle">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Identificador</th>
            <th className="text-end">Productos</th>
            <th><span className="visually-hidden">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {categorias.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-secondary py-4">Todavía no hay categorías.</td>
            </tr>
          )}
          {categorias.map((categoria) => {
            const cantidad = cantidadDeProductos(categoria.slug);
            return (
              <tr key={categoria.slug}>
                <td>{categoria.label}</td>
                <td><code>{categoria.slug}</code></td>
                <td className="text-end">{cantidad}</td>
                <td className="text-end text-nowrap">
                  <Button
                    as={Link}
                    to={`/admin/categorias/${categoria.slug}/editar`}
                    size="sm"
                    variant="outline-dark"
                    className="me-2"
                    aria-label={`Editar ${categoria.label}`}
                  >
                    Editar
                  </Button>
                  {/* Una categoría con productos no se puede eliminar: esos productos quedarían
                      apuntando a una categoría que ya no existe. */}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    disabled={cantidad > 0}
                    aria-label={`Eliminar ${categoria.label}`}
                    onClick={() => pedirConfirmacion(categoria)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <p className="small text-secondary">Solo se pueden eliminar las categorías que no tienen productos.</p>

      {/* animation={false}: el cuadro aparece y desaparece de inmediato, sin transición. */}
      <Modal
        show={Boolean(porEliminar)}
        onHide={() => setPorEliminar(null)}
        animation={false}
        centered
        aria-labelledby="titulo-eliminar-categoria"
      >
        <Modal.Header closeButton>
          <Modal.Title id="titulo-eliminar-categoria" as="h2" className="h5">Eliminar categoría</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Seguro que quieres eliminar la categoría <strong>{porEliminar?.label}</strong>? Esta acción no se
          puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setPorEliminar(null)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarEliminacion}>Eliminar categoría</Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}

export default AdminCategorias;