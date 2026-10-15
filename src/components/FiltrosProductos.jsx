import { Button, Col, Form, Row } from "react-bootstrap";

// Controles para filtrar el catálogo: búsqueda por texto, categoría y solo ofertas.
// Es un componente "controlado": no guarda nada, muestra los valores que recibe y avisa los
// cambios con onCambiar(campo, valor); quien lo usa decide dónde guardarlos (aquí, en la URL).
// Props: categorias, texto, categoria, soloOfertas, onCambiar, onLimpiar.
function FiltrosProductos({ categorias, texto, categoria, soloOfertas, onCambiar, onLimpiar }) {
  return (
    <Form aria-label="Filtros de productos" onSubmit={(evento) => evento.preventDefault()}>
      <Row className="g-3 align-items-end">
        <Col xs={12} md={5}>
          <Form.Group controlId="filtro-texto">
            <Form.Label>Buscar en el catálogo</Form.Label>
            <Form.Control
              type="search"
              placeholder="Nombre, marca o código"
              value={texto}
              onChange={(evento) => onCambiar("texto", evento.target.value)}
            />
          </Form.Group>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="filtro-categoria">
            <Form.Label>Categoría</Form.Label>
            <Form.Select value={categoria} onChange={(evento) => onCambiar("categoria", evento.target.value)}>
              <option value="">Todas</option>
              {categorias.map((item) => (
                <option key={item.slug} value={item.slug}>{item.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={12} sm={6} md={2}>
          <Form.Check
            type="switch"
            id="filtro-ofertas"
            label="Solo ofertas"
            checked={soloOfertas}
            onChange={(evento) => onCambiar("soloOfertas", evento.target.checked)}
          />
        </Col>
        <Col xs={12} md={2} className="d-grid">
          <Button variant="outline-secondary" onClick={onLimpiar}>Limpiar filtros</Button>
        </Col>
      </Row>
    </Form>
  );
}

export default FiltrosProductos;
