import { Badge } from "react-bootstrap";

// Etiqueta de color con el estado de una orden: "pagada" (verde) o "rechazada" (roja).
// Prop: estado, tal como se guarda en la orden. El texto siempre acompaña al color, para que
// no dependa solo de él.
function EstadoOrden({ estado }) {
  const aprobada = estado === "pagada";
  return <Badge bg={aprobada ? "success" : "danger"}>{aprobada ? "Pagada" : "Rechazada"}</Badge>;
}

export default EstadoOrden;