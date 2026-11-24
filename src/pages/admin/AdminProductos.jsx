import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import InsigniasProducto from "../../components/InsigniasProducto";
import PrecioProducto from "../../components/PrecioProducto";
import { nombreCategoria } from "../../utils/categorias";
import { filtrarProductos } from "../../utils/productos";

// Listado de productos del panel de administración: buscador, filtro por categoría, tabla y
// eliminación con confirmación.
// Props:
//   productos          -> arreglo de productos
//   categorias         -> arreglo de { slug, label }, para el filtro y para mostrar el nombre
//   onEliminar         -> función que recibe el id del producto y lo borra de la base de datos
// Estado propio: lo escrito en el buscador, la categoría elegida y el mensaje de resultado.
function AdminProductos({ productos, categorias, onEliminar }) {
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("");

  // Se reutiliza el mismo filtro de la tienda: busca en nombre, marca, subcategoría y código.
  const visibles = filtrarProductos(productos, { texto, categoria });

  // Pide confirmación con el cuadro del navegador antes de borrar.
  async function eliminar(producto) {
    if (!window.confirm(`¿Seguro que quieres eliminar "${producto.nombre}" (${producto.id})? Esta acción no se puede deshacer. Las órdenes que ya lo incluyen conservan su registro.`)) return;
    setError("");
    try {
      await onEliminar(producto.id);
      setMensaje(`El producto "${producto.nombre}" se eliminó.`);
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  return (
    <section aria-labelledby="titulo-admin-productos">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 id="titulo-admin-productos" className="h3 mb-0">Productos</h1>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/admin/productos/criticos" className="btn btn-outline-dark">Stock crítico</Link>
          <Link to="/admin/productos/nuevo" className="btn btn-primary">Nuevo producto</Link>
        </div>
      </div>

      {mensaje && <div className="alert alert-success" role="status">{mensaje}</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <Row className="g-3 mb-3">
        <Col xs={12} md={7}>
          <Form.Group controlId="admin-productos-buscar">
            <Form.Label>Buscar</Form.Label>
            <Form.Control
              type="search"
              value={texto}
              placeholder="Nombre, marca, subcategoría o código"
              onChange={(evento) => setTexto(evento.target.value)}
              autoComplete="off"
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={5}>
          <Form.Group controlId="admin-productos-categoria">
            <Form.Label>Categoría</Form.Label>
            <select id="admin-productos-categoria" className="form-select" value={categoria} onChange={(evento) => setCategoria(evento.target.value)}>
              <option value="">Todas</option>
              {categorias.map((item) => (
                <option key={item.slug} value={item.slug}>{item.label}</option>
              ))}
            </select>
          </Form.Group>
        </Col>
      </Row>

      <p className="small text-secondary" role="status">
        {visibles.length} de {productos.length} productos
      </p>

      {/* responsive: en pantallas angostas la tabla se desplaza hacia el lado en vez de romper
          el diseño. */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th className="text-end">Stock</th>
              <th><span className="visually-hidden">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-secondary py-4">
                  {productos.length === 0 ? "Todavía no hay productos." : "Ningún producto coincide con la búsqueda."}
                </td>
              </tr>
            )}
            {visibles.map((producto) => (
              <tr key={producto.id}>
                <td><code>{producto.id}</code></td>
                <td>
                  <Link to={`/admin/productos/${producto.id}`}>{producto.nombre}</Link>
                  <div className="small text-secondary">{producto.marca}</div>
                  <InsigniasProducto producto={producto} />
                </td>
                <td>{nombreCategoria(categorias, producto.categoria)}</td>
                <td className="text-nowrap"><PrecioProducto producto={producto} /></td>
                <td className="text-end">{producto.stock}</td>
                <td className="text-end text-nowrap">
                  <Link
                    to={`/admin/productos/${producto.id}`}
                    className="btn btn-sm btn-outline-dark me-2"
                    aria-label={`Ver ${producto.nombre}`}
                  >
                    Ver
                  </Link>
                  <Link
                    to={`/admin/productos/${producto.id}/editar`}
                    className="btn btn-sm btn-outline-dark me-2"
                    aria-label={`Editar ${producto.nombre}`}
                  >
                    Editar
                  </Link>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    aria-label={`Eliminar ${producto.nombre}`}
                    onClick={() => eliminar(producto)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </section>
  );
}

export default AdminProductos;