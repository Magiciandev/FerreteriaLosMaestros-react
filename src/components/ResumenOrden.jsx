import { Col, Row } from "react-bootstrap";
import { etiquetaEntrega, requiereDireccion } from "../services/compras";
import TablaItems from "./TablaItems";

// Resumen de una orden: datos del cliente, forma de entrega y productos con el total.
// Prop: orden, tal como se guarda en la base de datos (ver ordenesDB).
function ResumenOrden({ orden }) {
  const { cliente, entrega } = orden;
  return (
    <section aria-label="Resumen de la compra">
      <Row className="g-3 mb-3">
        <Col xs={12} md={6}>
          <h2 className="h6">Cliente</h2>
          <p className="mb-0">{cliente.nombre} {cliente.apellidos}</p>
          <p className="mb-0">{cliente.correo}</p>
        </Col>
        <Col xs={12} md={6}>
          <h2 className="h6">Entrega</h2>
          <p className="mb-0">{etiquetaEntrega(entrega.tipo)}</p>
          {requiereDireccion(entrega.tipo) && (
            <address className="mb-0">
              {entrega.calle}{entrega.departamento && `, depto. ${entrega.departamento}`}
              <br />
              {entrega.comuna}, {entrega.region}
              {entrega.indicaciones && (<><br />Indicaciones: {entrega.indicaciones}</>)}
            </address>
          )}
        </Col>
      </Row>
      <TablaItems items={orden.items} total={orden.total} />
    </section>
  );
}

export default ResumenOrden;
