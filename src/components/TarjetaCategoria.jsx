import { Link } from "react-router-dom";

// Tarjeta de una categoría: nombre, cantidad de productos y enlace a su página.
// Props: categoria { slug, label } y cantidad (número de productos de la categoría).
function TarjetaCategoria({ categoria, cantidad }) {
  return (
    <article className="card tarjeta-categoria h-100">
      <div className="card-body">
        <h3 className="card-title h5">
          <Link to={`/categorias/${categoria.slug}`} className="stretched-link">{categoria.label}</Link>
        </h3>
        <p className="card-text text-secondary mb-0">
          {cantidad} {cantidad === 1 ? "producto" : "productos"}
        </p>
      </div>
    </article>
  );
}

export default TarjetaCategoria;
