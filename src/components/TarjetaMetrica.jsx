import { Card } from "react-bootstrap";
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
    <Card className="h-100">
      <Card.Body>
        <h2 className="h6 text-secondary">{titulo}</h2>
        <p className="display-6 mb-2">{valor}</p>
        <ul className="list-unstyled small text-secondary mb-3">
          {detalles.map((detalle) => (
            <li key={detalle}>{detalle}</li>
          ))}
        </ul>
        {to && <Link to={to} className="btn btn-sm btn-outline-dark">{enlace}</Link>}
      </Card.Body>
    </Card>
  );
}

export default TarjetaMetrica;