import { useState } from "react";
import { Alert, Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import InsigniasProducto from "../../components/InsigniasProducto";
import PrecioProducto from "../../components/PrecioProducto";
import { filtrarProductos, nombreCategoria } from "../../utils/productos";

// Listado de productos del panel de administración: buscador, filtro por categoría, tabla y
// eliminación con confirmación.
// Props:
//   productos          -> arreglo de productos (viene de useColeccion en App)
//   categorias         -> arreglo de { slug, label }, para el filtro y para mostrar el nombre
//   esAdministrador    -> true si la sesión es de Administrador. El Vendedor solo puede ver:
//                         no se le muestran Nuevo, Editar ni Eliminar (RF-09). El bloqueo real
//                         de las rutas lo hace RutaProtegida en App; esto solo evita mostrar
//                         botones que lo llevarían a "Acceso restringido".
//   onEliminar         -> función que recibe el id del producto y lo borra de la base de datos
// Estado propio: lo escrito en el buscador, la categoría elegida, el producto que se está por
// eliminar (abre el cuadro de confirmación) y el mensaje de resultado.
function AdminProductos({ productos, categorias, esAdministrador = false, onEliminar }) {
  const ubicacion = useLocation();
  // Si se llega desde el formulario (después de crear o editar), este trae un mensaje en el
  // estado de la navegación.
  const [mensaje, setMensaje] = useState(ubicacion.state?.mensaje ?? "");
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [porEliminar, setPorEliminar] = useState(null);

  // Se reutiliza el mismo filtro de la tienda: busca en nombre, marca, subcategoría y código.
  const visibles = filtrarProductos(productos, { texto, categoria });

  function pedirConfirmacion(producto) {
    setMensaje("");
    setPorEliminar(producto);
  }

  function confirmarEliminacion() {
    onEliminar(porEliminar.id);
    setMensaje(`El producto "${porEliminar.nombre}" se eliminó.`);
    setPorEliminar(null);
  }

  return (
    <section aria-labelledby="titulo-admin-productos">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 id="titulo-admin-productos" className="h3 mb-0">Productos</h1>
        {esAdministrador && (
          <div className="d-flex flex-wrap gap-2">
            <Link to="/admin/productos/criticos" className="btn btn-outline-dark">Stock crítico</Link>
            <Link to="/admin/productos/nuevo" className="btn btn-primary">Nuevo producto</Link>
          </div>
        )}
      </div>

      {mensaje && <Alert variant="success" role="status">{mensaje}</Alert>}

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
            <Form.Select value={categoria} onChange={(evento) => setCategoria(evento.target.value)}>
              <option value="">Todas</option>
              {categorias.map((item) => (
                <option key={item.slug} value={item.slug}>{item.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <p className="small text-secondary" role="status">
        {visibles.length} de {productos.length} productos
      </p>

      {/* responsive: en pantallas angostas la tabla se desplaza hacia el lado en vez de romper
          el diseño. */}
      <Table responsive hover className="align-middle">
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
                {esAdministrador && (
                  <>
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
                      onClick={() => pedirConfirmacion(producto)}
                    >
                      Eliminar
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* animation={false}: el cuadro aparece y desaparece de inmediato, sin transición. */}
      <Modal
        show={Boolean(porEliminar)}
        onHide={() => setPorEliminar(null)}
        animation={false}
        centered
        aria-labelledby="titulo-eliminar-producto"
      >
        <Modal.Header closeButton>
          <Modal.Title id="titulo-eliminar-producto" as="h2" className="h5">Eliminar producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Seguro que quieres eliminar <strong>{porEliminar?.nombre}</strong> ({porEliminar?.id})? Esta acción
          no se puede deshacer. Las órdenes que ya lo incluyen conservan su registro.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setPorEliminar(null)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarEliminacion}>Eliminar producto</Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}

export default AdminProductos;