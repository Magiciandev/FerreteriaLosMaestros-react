import { Link } from "react-router-dom";

// Tarjeta con una cifra destacada del dashboard.
// Props:
//   titulo    -> qué se mide ("Compras", "Productos"...)
//   valor     -> la cifra principal, ya formateada
//   detalles  -> arreglo de textos cortos con cifras de apoyo (opcional)
//   to        -> ruta a la que lleva el enlace (opcional)
//   enlace    -> texto del enlace
// No tiene estado: solo muestra lo que recibe.
function TarjetaMetrica({ titulo, valor, detalles = [], to, enlace }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <h2 className="h6 text-secondary">{titulo}</h2>
        <p className="display-6 mb-2">{valor}</p>
        <ul className="list-unstyled small text-secondary mb-3">
          {detalles.map((detalle) => (
            <li key={detalle}>{detalle}</li>
          ))}
        </ul>
        {to && <Link to={to} className="btn btn-sm btn-outline-dark">{enlace}</Link>}
      </div>
    </div>
  );
}

export default TarjetaMetrica;