import { useState } from "react";
import { Button, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import ResumenOrden from "./ResumenOrden";

// Pantalla final de una compra aprobada: boleta con el detalle y acciones.
// Prop: orden, la orden ya guardada (Checkout la muestra cuando el pago se aprueba).
// Estado propio: si se pulsó "Enviar boleta por correo" (solo muestra un aviso simulado).
function PagoExitoso({ orden }) {
  const [enviada, setEnviada] = useState(false);

  return (
    <Container className="py-4 boleta">
      <div className="alert alert-success mb-4">
        <h1 className="h4 mb-0">Se ha realizado la compra. N.° {orden.id}</h1>
      </div>
      <p className="text-secondary">Fecha: {new Date(orden.fecha).toLocaleString("es-CL")}</p>
      <ResumenOrden orden={orden} />
      {enviada && (
        <div className="alert alert-info no-imprimir" role="status">
          Enviamos la boleta a {orden.cliente.correo} (simulación: no se envía ningún correo real).
        </div>
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
