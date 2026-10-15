import { useState } from "react";
import { Alert, Button, Container } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import ResumenOrden from "../components/ResumenOrden";

// Compra aprobada. El número de orden llega en la dirección (?orden=ORD-0001), así la página
// sigue funcionando si se recarga. Prop: ordenes, todas las órdenes guardadas.
// Estado propio: si ya se "envió" la boleta por correo.
function PagoExitoso({ ordenes }) {
  const [parametros] = useSearchParams();
  const [enviada, setEnviada] = useState(false);
  const orden = ordenes.find((item) => item.id === parametros.get("orden") && item.estado === "pagada");

  if (!orden) {
    return (
      <Container className="py-5">
        <h1>No encontramos esa compra</h1>
        <Link to="/productos" className="btn btn-primary">Ver productos</Link>
      </Container>
    );
  }

  return (
    <Container className="py-4 boleta">
      <Alert variant="success" className="mb-4">
        <h1 className="h4 mb-0">Se ha realizado la compra. N.° {orden.id}</h1>
      </Alert>
      <p className="text-secondary">Fecha: {new Date(orden.fecha).toLocaleString("es-CL")}</p>
      <ResumenOrden orden={orden} />
      {enviada && (
        <Alert variant="info" role="status" className="no-imprimir">
          Enviamos la boleta a {orden.cliente.correo} (simulación: no se envía ningún correo real).
        </Alert>
      )}
      <div className="d-flex flex-wrap gap-2 no-imprimir">
        <Button variant="outline-secondary" onClick={() => window.print()}>Imprimir boleta</Button>
        <Button variant="outline-secondary" onClick={() => setEnviada(true)}>Enviar boleta por correo</Button>
        <Link to="/productos" className="btn btn-primary">Seguir comprando</Link>
      </div>
    </Container>
  );
}

export default PagoExitoso;
