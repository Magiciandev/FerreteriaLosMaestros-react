import { Toast, ToastContainer } from "react-bootstrap";
import { Link } from "react-router-dom";

// Aviso breve que aparece al agregar un producto al carrito y se cierra solo.
// Props: mensaje (texto), visible (si se muestra) y onCerrar (se ejecuta al cerrarlo o al
// pasar el tiempo). El estado vive en App porque el aviso se dispara desde varias páginas.
function AvisoCarrito({ mensaje, visible, onCerrar }) {
  return (
    <ToastContainer position="bottom-end" className="position-fixed p-3">
      <Toast show={visible} onClose={onCerrar} autohide delay={3500}>
        <Toast.Header closeButton closeLabel="Cerrar aviso">
          <strong className="me-auto">Carrito</strong>
        </Toast.Header>
        <Toast.Body>
          <p className="mb-2">{mensaje}</p>
          <Link to="/carrito">Ver carrito</Link>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default AvisoCarrito;
