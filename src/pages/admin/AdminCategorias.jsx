import { useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

// Listado de categorías del panel de administración: tabla con la cantidad de productos de cada
// una, acceso a crear y editar, y eliminación con confirmación.
// Props:
//   categorias  -> arreglo de { slug, label }
//   productos   -> para contar cuántos usa cada categoría
//   onEliminar  -> función que recibe el slug y la borra de la base de datos simulada
// Estado propio: el mensaje de resultado.
function AdminCategorias({ categorias, productos, onEliminar }) {
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  function cantidadDeProductos(slug) {
    return productos.filter((producto) => producto.categoria === slug).length;
  }

  // Pide confirmación con el cuadro del navegador antes de borrar.
  async function eliminar(categoria) {
    if (!window.confirm(`¿Seguro que quieres eliminar la categoría "${categoria.label}"? Esta acción no se puede deshacer.`)) return;
    setError("");
    try {
      await onEliminar(categoria.slug);
      setMensaje(`La categoría "${categoria.label}" se eliminó.`);
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  return (
    <section aria-labelledby="titulo-admin-categorias">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 id="titulo-admin-categorias" className="h3 mb-0">Categorías</h1>
        <Button as={Link} to="/admin/categorias/nueva" variant="primary">Nueva categoría</Button>
      </div>

      {mensaje && <div className="alert alert-success" role="status">{mensaje}</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="table-responsive">
        <table className="table table-hover align-middle">
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
                      onClick={() => eliminar(categoria)}
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
      <p className="small text-secondary">Solo se pueden eliminar las categorías que no tienen productos.</p>

    </section>
  );
}

export default AdminCategorias;