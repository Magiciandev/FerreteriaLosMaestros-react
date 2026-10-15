import { Table } from "react-bootstrap";
import { formatearCLP } from "../utils/formato";

// Tabla de solo lectura con los productos de una compra.
// Props: items (arreglo de { idProducto, nombre, precioUnitario, cantidad, subtotal }) y, si se
// quiere mostrar la fila final, total. Se usa en el checkout y en el resumen de la orden.
function TablaItems({ items, total }) {
  return (
    <Table responsive size="sm" className="align-middle">
      <caption className="visually-hidden">Productos de la compra</caption>
      <thead>
        <tr>
          <th scope="col">Producto</th>
          <th scope="col" className="text-end">Precio</th>
          <th scope="col" className="text-end">Cantidad</th>
          <th scope="col" className="text-end">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.idProducto}>
            <td>{item.nombre}</td>
            <td className="text-end">{formatearCLP(item.precioUnitario)}</td>
            <td className="text-end">{item.cantidad}</td>
            <td className="text-end">{formatearCLP(item.subtotal)}</td>
          </tr>
        ))}
      </tbody>
      {total !== undefined && (
        <tfoot>
          <tr>
            <th scope="row" colSpan={3} className="text-end">Total</th>
            <td className="text-end fw-bold">{formatearCLP(total)}</td>
          </tr>
        </tfoot>
      )}
    </Table>
  );
}

export default TablaItems;
