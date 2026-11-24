import { Container } from "react-bootstrap";
import GrillaProductos from "../components/GrillaProductos";
import { filtrarProductos } from "../utils/productos";

// Productos con descuento, ordenados de mayor a menor descuento.
// Props: productos y onAgregar.
function Ofertas({ productos, onAgregar }) {
  return (
    <Container className="py-4">
      <h1 className="mb-3">Ofertas</h1>
      <GrillaProductos
        productos={filtrarProductos(productos, { soloOfertas: true }).sort((a, b) => b.descuento - a.descuento)}
        onAgregar={onAgregar}
        mensajeVacio="Por ahora no hay productos en oferta."
      />
    </Container>
  );
}

export default Ofertas;
