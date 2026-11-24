// Control para subir o bajar la cantidad de un producto en el carrito.
// Props: nombre (para lectores de pantalla), cantidad, maximo (el stock) y onCambiar(nuevaCantidad).
// No guarda nada: muestra la cantidad que recibe y avisa el cambio.
function ControlCantidad({ nombre, cantidad, maximo, onCambiar }) {
  return (
    <div className="d-inline-flex align-items-center gap-2" role="group" aria-label={`Cantidad de ${nombre}`}>
      <button
        className="btn btn-sm btn-outline-secondary"
        aria-label={`Disminuir cantidad de ${nombre}`}
        disabled={cantidad <= 1}
        onClick={() => onCambiar(cantidad - 1)}
      >
        -
      </button>
      <span aria-live="polite">{cantidad}</span>
      <button
        className="btn btn-sm btn-outline-secondary"
        aria-label={`Aumentar cantidad de ${nombre}`}
        disabled={cantidad >= maximo}
        onClick={() => onCambiar(cantidad + 1)}
      >
        +
      </button>
    </div>
  );
}

export default ControlCantidad;
