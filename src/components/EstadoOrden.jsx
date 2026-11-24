// Etiqueta con el estado de una orden: "pagada" (verde) o "rechazada" (roja).
// El texto siempre acompaña al color, para que no dependa solo de él.
function EstadoOrden({ estado }) {
  const aprobada = estado === "pagada";
  return <span className={`badge ${aprobada ? "bg-success" : "bg-danger"}`}>{aprobada ? "Pagada" : "Rechazada"}</span>;
}

export default EstadoOrden;
