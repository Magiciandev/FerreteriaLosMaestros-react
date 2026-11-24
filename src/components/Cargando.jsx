import { Spinner } from "react-bootstrap";

// Indicador de carga: se muestra mientras se esperan datos del servidor.
function Cargando() {
  return (
    <div className="text-center py-5">
      <Spinner animation="border" role="status" aria-label="Cargando" />
    </div>
  );
}

export default Cargando;
