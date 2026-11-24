import { Button, Container } from "react-bootstrap";
import ResumenOrden from "./ResumenOrden";

// Pantalla final de un pago rechazado. Props: orden (el intento, que queda registrado) y
// onReintentar, que vuelve al formulario de compra con los datos que la persona ya escribió.
// El carrito se conserva para poder intentarlo de nuevo.
function PagoError({ orden, onReintentar }) {
  return (
    <Container className="py-4">
      <div className="alert alert-danger mb-4" role="alert">
        <h1 className="h4 mb-0">No se pudo realizar el pago. N.° {orden.id}</h1>
      </div>
      <p>Tu carrito sigue guardado. Puedes intentarlo nuevamente.</p>
      <Button variant="primary" className="mb-4" onClick={onReintentar}>Volver a realizar el pago</Button>
      <ResumenOrden orden={orden} />
    </Container>
  );
}

export default PagoError;
