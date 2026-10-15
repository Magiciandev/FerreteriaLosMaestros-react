import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { estaDisponible } from "../utils/productos";
import ImagenProducto from "./ImagenProducto";
import InsigniasProducto from "./InsigniasProducto";
import PrecioProducto from "./PrecioProducto";

// Tarjeta de un producto en una grilla.
// Props:
//   producto   -> objeto { id, nombre, marca, unidad, precio, descuento, stock, ... }
//   onAgregar  -> función que ejecuta quien la usa cuando se pulsa "Agregar al carrito";
//                 recibe el producto. La tarjeta no sabe qué pasa después: solo avisa.
// No tiene estado propio: todo lo que muestra sale de sus props.
function TarjetaProducto({ producto, onAgregar }) {
  const disponible = estaDisponible(producto);
  return (
    <Card as="article" className="tarjeta-producto h-100 overflow-hidden">
      <ImagenProducto producto={producto} />
      <Card.Body className="d-flex flex-column gap-2">
        <InsigniasProducto producto={producto} />
        <Card.Title as="h3" className="h6 mb-0">
          <Link to={`/productos/${producto.id}`}>{producto.nombre}</Link>
        </Card.Title>
        <Card.Text className="small text-secondary mb-0">
          {producto.marca} - {producto.unidad}
        </Card.Text>
        <PrecioProducto producto={producto} />
        <Button
          variant="primary"
          className="mt-auto"
          disabled={!disponible}
          aria-label={`Agregar ${producto.nombre} al carrito`}
          onClick={() => onAgregar(producto)}
        >
          Agregar al carrito
        </Button>
      </Card.Body>
    </Card>
  );
}

export default TarjetaProducto;
