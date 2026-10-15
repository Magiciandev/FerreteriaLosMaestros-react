import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { formatearFecha } from "../utils/formato";

// Tarjeta de una entrada del blog. Prop: entrada { id, titulo, resumen, autor, fecha }.
function TarjetaBlog({ entrada }) {
  return (
    <Card as="article" className="h-100">
      <Card.Body className="d-flex flex-column">
        <Card.Subtitle className="small text-secondary mb-2">
          {formatearFecha(entrada.fecha)} - {entrada.autor}
        </Card.Subtitle>
        <Card.Title as="h2" className="h5">{entrada.titulo}</Card.Title>
        <Card.Text>{entrada.resumen}</Card.Text>
        <Link to={`/blog/${entrada.id}`} className="mt-auto" aria-label={`Leer más: ${entrada.titulo}`}>
          Leer más
        </Link>
      </Card.Body>
    </Card>
  );
}

export default TarjetaBlog;
