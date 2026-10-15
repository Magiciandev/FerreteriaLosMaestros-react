import { Container } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { formatearFecha } from "../utils/formato";

// Una entrada del blog completa. El id sale de la URL (/blog/:id). Prop: entradas.
function DetalleBlog({ entradas }) {
  const { id } = useParams();
  const entrada = entradas.find((item) => item.id === id);

  if (!entrada) {
    return (
      <Container className="py-5">
        <h1>La entrada no existe</h1>
        <Link to="/blog" className="btn btn-primary">Volver al blog</Link>
      </Container>
    );
  }

  return (
    <Container as="article" className="py-4 articulo-blog">
      <p className="mb-1"><Link to="/blog">Volver al blog</Link></p>
      <h1>{entrada.titulo}</h1>
      <p className="text-secondary">{formatearFecha(entrada.fecha)} - {entrada.autor}</p>
      {entrada.contenido.map((parrafo, posicion) => (
        <p key={posicion}>{parrafo}</p>
      ))}
    </Container>
  );
}

export default DetalleBlog;
