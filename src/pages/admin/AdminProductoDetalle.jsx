import { Alert, Col, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import ImagenProducto from "../../components/ImagenProducto";
import InsigniasProducto from "../../components/InsigniasProducto";
import PrecioProducto from "../../components/PrecioProducto";
import { formatearCLP } from "../../utils/formato";
import { nombreCategoria, precioFinal, tieneOferta } from "../../utils/productos";

// Ficha completa de un producto para el panel (ruta /admin/productos/:id). A diferencia del
// detalle de la tienda no tiene carrito: muestra también los datos internos (código, stock
// mínimo) que el cliente no ve.
// Props:
//   productos        -> arreglo de productos; el que se muestra se busca con el :id de la URL
//   categorias       -> para mostrar el nombre de la categoría y no su identificador
//   esAdministrador  -> solo el Administrador ve el botón Editar
// No tiene estado propio: todo se calcula a partir de las props y de la URL.
function AdminProductoDetalle({ productos, categorias, esAdministrador = false }) {
  const { id } = useParams();
  const producto = productos.find((actual) => actual.id === id);

  if (!producto) {
    return (
      <section>
        <Alert variant="warning">
          No encontramos el producto "{id}". <Alert.Link as={Link} to="/admin/productos">Volver al listado</Alert.Link>
        </Alert>
      </section>
    );
  }

  // Pares etiqueta / valor de la ficha. Así la lista se dibuja con un solo map.
  const ficha = [
    ["Código", producto.id],
    ["Categoría", nombreCategoria(categorias, producto.categoria)],
    ["Subcategoría", producto.subcategoria],
    ["Marca", producto.marca],
    ["Unidad", producto.unidad],
    ["Precio de lista", formatearCLP(producto.precio)],
    ["Descuento", tieneOferta(producto) ? `${producto.descuento}% (precio final ${formatearCLP(precioFinal(producto))})` : "Sin oferta"],
    ["Stock", `${producto.stock} unidades`],
    ["Stock mínimo", producto.stockMinimo != null ? `${producto.stockMinimo} unidades` : "No definido"],
    ["Descripción", producto.descripcion || "Sin descripción"],
  ];

  return (
    <section aria-labelledby="titulo-admin-producto">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 id="titulo-admin-producto" className="h3 mb-0">{producto.nombre}</h1>
        <div className="d-flex gap-2">
          <Link to="/admin/productos" className="btn btn-outline-secondary">Volver al listado</Link>
          {esAdministrador && (
            <Link to={`/admin/productos/${producto.id}/editar`} className="btn btn-primary">Editar producto</Link>
          )}
        </div>
      </div>

      <Row className="g-4">
        <Col xs={12} md={5} lg={4}>
          <ImagenProducto producto={producto} />
          <div className="mt-3">
            <PrecioProducto producto={producto} className="fs-4" />
            <div className="mt-2"><InsigniasProducto producto={producto} /></div>
          </div>
        </Col>
        <Col xs={12} md={7} lg={8}>
          <dl className="mb-0">
            {ficha.map(([etiqueta, valor]) => (
              <div className="row mb-2" key={etiqueta}>
                <dt className="col-sm-4">{etiqueta}</dt>
                <dd className="col-sm-8 mb-0">{valor}</dd>
              </div>
            ))}
          </dl>
        </Col>
      </Row>
    </section>
  );
}

export default AdminProductoDetalle;