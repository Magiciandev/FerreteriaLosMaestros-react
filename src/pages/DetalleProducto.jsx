import { useState } from "react";
import { Alert, Breadcrumb, Button, Col, Container, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import CampoFormulario from "../components/CampoFormulario";
import ImagenProducto from "../components/ImagenProducto";
import InsigniasProducto from "../components/InsigniasProducto";
import PrecioProducto from "../components/PrecioProducto";
import { estaDisponible, nombreCategoria } from "../utils/productos";

// Detalle de un producto: ficha, precio y selector de cantidad para agregar al carrito.
// El id sale de la URL (/productos/:id). Props: productos, categorias y
// onAgregar(producto, cantidad).
// Estado propio: la cantidad elegida, como texto, para que el campo se pueda borrar mientras se escribe.
function DetalleProducto({ productos, categorias, onAgregar }) {
  const { id } = useParams();
  const [cantidad, setCantidad] = useState("1");
  const producto = productos.find((item) => item.id === id);

  if (!producto) {
    return (
      <Container className="py-5">
        <h1>El producto no existe</h1>
        <p className="text-secondary">Puede que haya sido retirado del catálogo o que el enlace esté mal escrito.</p>
        <Link to="/productos" className="btn btn-primary">Volver a productos</Link>
      </Container>
    );
  }

  const disponible = estaDisponible(producto);
  const unidades = Number(cantidad);
  const cantidadValida = Number.isInteger(unidades) && unidades >= 1 && unidades <= producto.stock;
  const errorCantidad = disponible && !cantidadValida ? `Ingresa una cantidad entre 1 y ${producto.stock}.` : "";

  return (
    <Container className="py-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/productos" }}>Productos</Breadcrumb.Item>
        <Breadcrumb.Item active>{producto.nombre}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="g-4">
        <Col xs={12} md={5}>
          <ImagenProducto producto={producto} className="rounded border overflow-hidden" />
        </Col>
        <Col xs={12} md={7}>
          <InsigniasProducto producto={producto} />
          <h1 className="h2 mt-2">{producto.nombre}</h1>
          <PrecioProducto producto={producto} className="fs-3 mb-3" />

          <dl className="row mb-4">
            <dt className="col-5 col-sm-4">Código</dt>
            <dd className="col-7 col-sm-8">{producto.id}</dd>
            <dt className="col-5 col-sm-4">Categoría</dt>
            <dd className="col-7 col-sm-8">
              <Link to={`/categorias/${producto.categoria}`}>{nombreCategoria(categorias, producto.categoria)}</Link>
            </dd>
            <dt className="col-5 col-sm-4">Subcategoría</dt>
            <dd className="col-7 col-sm-8">{producto.subcategoria}</dd>
            <dt className="col-5 col-sm-4">Marca</dt>
            <dd className="col-7 col-sm-8">{producto.marca}</dd>
            <dt className="col-5 col-sm-4">Se vende por</dt>
            <dd className="col-7 col-sm-8">{producto.unidad}</dd>
            <dt className="col-5 col-sm-4">Stock</dt>
            <dd className="col-7 col-sm-8">{producto.stock} unidades</dd>
          </dl>

          {disponible ? (
            <div className="d-flex flex-wrap align-items-start gap-3">
              <div className="campo-cantidad">
                <CampoFormulario
                  id="cantidad"
                  etiqueta="Cantidad"
                  tipo="number"
                  min={1}
                  max={producto.stock}
                  valor={cantidad}
                  error={errorCantidad}
                  onChange={(evento) => setCantidad(evento.target.value)}
                />
              </div>
              <Button
                variant="primary"
                size="lg"
                className="mt-lg-4"
                disabled={!cantidadValida}
                onClick={() => onAgregar(producto, unidades)}
              >
                Agregar al carrito
              </Button>
            </div>
          ) : (
            <Alert variant="warning">Este producto no tiene stock por ahora.</Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default DetalleProducto;
