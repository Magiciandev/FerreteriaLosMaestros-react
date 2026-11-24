import { Link } from "react-router-dom";
import { formatearFecha } from "../utils/formato";

// Tarjeta de una entrada del blog. Prop: entrada { id, titulo, resumen, autor, fecha }.
function TarjetaBlog({ entrada }) {
  return (
    <article className="card h-100">
      <div className="card-body d-flex flex-column">
        <p className="card-subtitle small text-secondary mb-2">
          {formatearFecha(entrada.fecha)} - {entrada.autor}
        </p>
        <h2 className="card-title h5">{entrada.titulo}</h2>
        <p className="card-text">{entrada.resumen}</p>
        <Link to={`/blog/${entrada.id}`} className="mt-auto" aria-label={`Leer más: ${entrada.titulo}`}>
          Leer más
        </Link>
      </div>
    </article>
  );
}

export default TarjetaBlog;
