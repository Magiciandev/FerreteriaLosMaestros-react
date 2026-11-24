import { esStockCritico, estaDisponible, tieneOferta } from "../utils/productos";

// Etiquetas que describen el estado del producto: descuento, sin stock o últimas unidades.
// Cada una aparece solo si se cumple su condición.
function InsigniasProducto({ producto }) {
  const disponible = estaDisponible(producto);
  return (
    <div className="d-flex flex-wrap gap-1">
      {tieneOferta(producto) && <span className="badge text-bg-danger">-{producto.descuento}%</span>}
      {!disponible && <span className="badge text-bg-secondary">Sin stock</span>}
      {disponible && esStockCritico(producto) && (
        <span className="badge text-bg-warning">Últimas unidades</span>
      )}
    </div>
  );
}

export default InsigniasProducto;
