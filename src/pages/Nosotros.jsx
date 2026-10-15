import { Card, Col, Container, Row } from "react-bootstrap";

const PERFILES = [
  {
    titulo: "Para particulares",
    texto: "Arreglos del hogar, remodelaciones pequeñas y herramientas para el día a día, con información clara para elegir el producto adecuado.",
  },
  {
    titulo: "Para contratistas",
    texto: "Materiales para equipar una obra, con compra en línea y despacho a obra para no detener el trabajo.",
  },
  {
    titulo: "Compra en línea",
    texto: "Revisa el catálogo, compara precios y ofertas, y arma tu carrito desde el computador o el celular.",
  },
];

// Página informativa. Prop: categorias, para listar lo que se vende.
function Nosotros({ categorias }) {
  return (
    <Container className="py-4">
      <h1 className="mb-3">Nosotros</h1>
      <p className="lead">
        Ferretería Los Maestros es una tienda de materiales de construcción, herramientas y gasfitería
        pensada tanto para quien hace una reparación en casa como para quien equipa una obra.
      </p>
      <p>
        En nuestro catálogo encontrarás productos de {categorias.length} categorías:{" "}
        {categorias.map((categoria) => categoria.label).join(", ")}.
      </p>

      <Row className="g-3 mt-2">
        {PERFILES.map((perfil) => (
          <Col key={perfil.titulo} xs={12} md={4}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title as="h2" className="h5">{perfil.titulo}</Card.Title>
                <Card.Text>{perfil.texto}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Nosotros;
