import { Button } from "react-bootstrap";
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
    <article className="card tarjeta-producto h-100 overflow-hidden">
      <ImagenProducto producto={producto} />
      <div className="card-body d-flex flex-column gap-2">
        <InsigniasProducto producto={producto} />
        <h3 className="card-title h6 mb-0">
          <Link to={`/productos/${producto.id}`}>{producto.nombre}</Link>
        </h3>
        <p className="card-text small text-secondary mb-0">
          {producto.marca} - {producto.unidad}
        </p>
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
      </div>
    </article>
  );
}

export default TarjetaProducto;
