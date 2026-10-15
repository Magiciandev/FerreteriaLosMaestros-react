import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

// Tarjeta de una categoría: nombre, cantidad de productos y enlace a su página.
// Props: categoria { slug, label } y cantidad (número de productos de la categoría).
function TarjetaCategoria({ categoria, cantidad }) {
  return (
    <Card as="article" className="tarjeta-categoria h-100">
      <Card.Body>
        <Card.Title as="h3" className="h5">
          <Link to={`/categorias/${categoria.slug}`} className="stretched-link">{categoria.label}</Link>
        </Card.Title>
        <Card.Text className="text-secondary mb-0">
          {cantidad} {cantidad === 1 ? "producto" : "productos"}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default TarjetaCategoria;
