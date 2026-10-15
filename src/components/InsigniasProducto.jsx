import { Badge } from "react-bootstrap";
import { esStockCritico, estaDisponible, tieneOferta } from "../utils/productos";

// Etiquetas que describen el estado del producto: descuento, sin stock o últimas unidades.
// Cada una aparece solo si se cumple su condición.
function InsigniasProducto({ producto }) {
  const disponible = estaDisponible(producto);
  return (
    <div className="d-flex flex-wrap gap-1">
      {tieneOferta(producto) && <Badge bg="danger">-{producto.descuento}%</Badge>}
      {!disponible && <Badge bg="secondary">Sin stock</Badge>}
      {disponible && esStockCritico(producto) && (
        <Badge bg="warning" text="dark">Últimas unidades</Badge>
      )}
    </div>
  );
}

export default InsigniasProducto;
