import { Alert, Button, Container, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import ControlCantidad from "../components/ControlCantidad";
import { formatearCLP } from "../utils/formato";
import { calcularTotal } from "../utils/carrito";

// Carrito de compras: lista editable de lo que se va a comprar.
// Props:
//   lineas            productos del carrito ya reconstruidos contra el catálogo (detallarCarrito)
//   onCambiarCantidad (idProducto, cantidad)
//   onQuitar          (idProducto)
//   onVaciar          ()
// No guarda nada: todo viene de App por props y los cambios se avisan con funciones.
function Carrito({ lineas, onCambiarCantidad, onQuitar, onVaciar }) {
  if (lineas.length === 0) {
    return (
      <Container className="py-5">
        <h1>Carrito de compras</h1>
        <Alert variant="light" className="border">Tu carrito está vacío.</Alert>
        <Link to="/productos" className="btn btn-primary">Ver productos</Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-3">Carrito de compras</h1>
      {lineas.some((linea) => linea.ajustada) && (
        <Alert variant="warning">Ajustamos algunas cantidades al stock disponible.</Alert>
      )}
      <Table responsive className="align-middle">
        <caption className="visually-hidden">Productos en tu carrito</caption>
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col" className="text-end">Precio</th>
            <th scope="col" className="text-center">Cantidad</th>
            <th scope="col" className="text-end">Subtotal</th>
            <th scope="col"><span className="visually-hidden">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {lineas.map((linea) => (
            <tr key={linea.idProducto}>
              <td><Link to={`/productos/${linea.idProducto}`}>{linea.nombre}</Link></td>
              <td className="text-end">{formatearCLP(linea.precioUnitario)}</td>
              <td className="text-center">
                <ControlCantidad
                  nombre={linea.nombre}
                  cantidad={linea.cantidad}
                  maximo={linea.stock}
                  onCambiar={(cantidad) => onCambiarCantidad(linea.idProducto, cantidad)}
                />
              </td>
              <td className="text-end">{formatearCLP(linea.subtotal)}</td>
              <td className="text-end">
                <Button
                  size="sm"
                  variant="outline-danger"
                  aria-label={`Quitar ${linea.nombre} del carrito`}
                  onClick={() => onQuitar(linea.idProducto)}
                >
                  Quitar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={3} className="text-end">Total</th>
            <td className="text-end fw-bold">{formatearCLP(calcularTotal(lineas))}</td>
            <td />
          </tr>
        </tfoot>
      </Table>
      <div className="d-flex flex-wrap justify-content-between gap-2">
        <Button variant="outline-secondary" onClick={onVaciar}>Vaciar carrito</Button>
        <Link to="/checkout" className="btn btn-primary">Continuar con la compra</Link>
      </div>
    </Container>
  );
}

export default Carrito;
