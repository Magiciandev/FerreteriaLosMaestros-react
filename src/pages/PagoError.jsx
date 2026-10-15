import { Alert, Container } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import ResumenOrden from "../components/ResumenOrden";

// Compra rechazada. El carrito se conserva; "Volver a realizar el pago" lleva de vuelta al
// checkout con los mismos datos ya escritos. Prop: ordenes, todas las órdenes guardadas.
function PagoError({ ordenes }) {
  const [parametros] = useSearchParams();
  const orden = ordenes.find((item) => item.id === parametros.get("orden") && item.estado === "rechazada");

  if (!orden) {
    return (
      <Container className="py-5">
        <h1>No encontramos ese intento de pago</h1>
        <Link to="/carrito" className="btn btn-primary">Ir al carrito</Link>
      </Container>
    );
  }

  // Datos del checkout para que el formulario vuelva a aparecer completo.
  const datos = {
    nombre: orden.cliente.nombre,
    apellidos: orden.cliente.apellidos,
    correo: orden.cliente.correo,
    entrega: orden.entrega.tipo,
    calle: orden.entrega.calle,
    departamento: orden.entrega.departamento,
    region: orden.entrega.region,
    comuna: orden.entrega.comuna,
    indicaciones: orden.entrega.indicaciones,
  };

  return (
    <Container className="py-4">
      <Alert variant="danger" className="mb-4" role="alert">
        <h1 className="h4 mb-0">No se pudo realizar el pago. N.° {orden.id}</h1>
      </Alert>
      <p>Tu carrito sigue guardado. Puedes intentarlo nuevamente.</p>
      <Link to="/checkout" state={{ datos }} className="btn btn-primary mb-4">Volver a realizar el pago</Link>
      <ResumenOrden orden={orden} />
    </Container>
  );
}

export default PagoError;
