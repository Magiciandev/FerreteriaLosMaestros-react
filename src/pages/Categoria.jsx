import { Container } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import GrillaProductos from "../components/GrillaProductos";

// Productos de una categoría. El slug sale de la URL (/categorias/:slug).
// Props: categorias, productos y onAgregar.
function Categoria({ categorias, productos, onAgregar }) {
  const { slug } = useParams();
  const categoria = categorias.find((item) => item.slug === slug);

  if (!categoria) {
    return (
      <Container className="py-5">
        <h1>La categoría no existe</h1>
        <Link to="/categorias" className="btn btn-primary">Ver todas las categorías</Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <p className="mb-1"><Link to="/categorias">Categorías</Link></p>
      <h1 className="mb-3">{categoria.label}</h1>
      <GrillaProductos
        productos={productos.filter((producto) => producto.categoria === slug)}
        onAgregar={onAgregar}
        mensajeVacio="Esta categoría todavía no tiene productos."
      />
    </Container>
  );
}

export default Categoria;
