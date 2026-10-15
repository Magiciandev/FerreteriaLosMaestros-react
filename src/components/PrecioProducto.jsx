import { formatearCLP } from "../utils/formato";
import { precioFinal, tieneOferta } from "../utils/productos";

// Precio del producto. Con oferta muestra el precio de lista tachado y el precio con descuento;
// sin oferta, un solo precio. Los textos ocultos ayudan a quien usa lector de pantalla.
function PrecioProducto({ producto, className = "" }) {
  if (!tieneOferta(producto)) {
    return <p className={`precio-producto mb-0 ${className}`}><strong>{formatearCLP(producto.precio)}</strong></p>;
  }
  return (
    <p className={`precio-producto mb-0 ${className}`}>
      <span className="visually-hidden">Precio normal: </span>
      <span className="precio-lista me-2">{formatearCLP(producto.precio)}</span>
      <span className="visually-hidden">Precio con descuento: </span>
      <strong>{formatearCLP(precioFinal(producto))}</strong>
    </p>
  );
}

export default PrecioProducto;
