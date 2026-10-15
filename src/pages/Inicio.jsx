import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import GrillaProductos from "../components/GrillaProductos";
import TarjetaCategoria from "../components/TarjetaCategoria";
import { estaDisponible, productosEnOferta } from "../utils/productos";

// Página de inicio: portada, categorías y las ofertas con más descuento que tienen stock.
// Props: productos, categorias y onAgregar (se pasa a las tarjetas de producto).
function Inicio({ productos, categorias, onAgregar }) {
  const ofertas = productosEnOferta(productos).filter(estaDisponible).slice(0, 4);

  return (
    <>
      <section className="portada py-5">
        <Container>
          <h1 className="display-5">Todo para tu obra y tu hogar</h1>
          <p className="lead mb-4">
            Materiales de construcción, herramientas y gasfitería para particulares y contratistas.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/productos" className="btn btn-primary btn-lg">Ver productos</Link>
            <Link to="/ofertas" className="btn btn-outline-light btn-lg">Ver ofertas</Link>
          </div>
        </Container>
      </section>

      <Container className="py-5">
        <section aria-labelledby="titulo-categorias" className="mb-5">
          <h2 id="titulo-categorias" className="mb-3">Categorías</h2>
          <Row className="g-3">
            {categorias.map((categoria) => (
              <Col key={categoria.slug} xs={6} md={4} lg={3}>
                <TarjetaCategoria
                  categoria={categoria}
                  cantidad={productos.filter((producto) => producto.categoria === categoria.slug).length}
                />
              </Col>
            ))}
          </Row>
        </section>

        {ofertas.length > 0 && (
          <section aria-labelledby="titulo-ofertas">
            <div className="d-flex flex-wrap justify-content-between align-items-baseline mb-3">
              <h2 id="titulo-ofertas" className="mb-0">Ofertas destacadas</h2>
              <Link to="/ofertas">Ver todas las ofertas</Link>
            </div>
            <GrillaProductos productos={ofertas} onAgregar={onAgregar} />
          </section>
        )}
      </Container>
    </>
  );
}

export default Inicio;
