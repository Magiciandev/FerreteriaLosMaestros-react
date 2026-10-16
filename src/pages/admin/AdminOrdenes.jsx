import { useState } from "react";
import { Col, Form, Row, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import EstadoOrden from "../../components/EstadoOrden";
import { etiquetaEntrega } from "../../services/compras";
import { ordenarPorFecha } from "../../utils/estadisticas";
import { formatearCLP, formatearFechaHora } from "../../utils/formato";

// Listado de órdenes (las más recientes primero) con buscador y filtro por estado. Lo ven el
// Administrador y el Vendedor; desde aquí se abre la boleta de cada una.
// Prop: ordenes, arreglo de la base de datos simulada.
// Estado propio: lo escrito en el buscador y el estado elegido en el filtro.
function AdminOrdenes({ ordenes }) {
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState("");

  // Busca por número de orden, nombre o correo del cliente, sin distinguir mayúsculas.
  const buscado = texto.trim().toLowerCase();
  const visibles = ordenarPorFecha(ordenes).filter((orden) => {
    const coincideEstado = estado === "" || orden.estado === estado;
    const datos = `${orden.id} ${orden.cliente.nombre} ${orden.cliente.apellidos} ${orden.cliente.correo}`.toLowerCase();
    return coincideEstado && datos.includes(buscado);
  });

  return (
    <section aria-labelledby="titulo-admin-ordenes">
      <h1 id="titulo-admin-ordenes" className="h3 mb-3">Órdenes</h1>

      <Row className="g-3 mb-3">
        <Col xs={12} md={7}>
          <Form.Group controlId="admin-ordenes-buscar">
            <Form.Label>Buscar</Form.Label>
            <Form.Control
              type="search"
              value={texto}
              placeholder="N.° de orden, nombre o correo del cliente"
              onChange={(evento) => setTexto(evento.target.value)}
              autoComplete="off"
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={5}>
          <Form.Group controlId="admin-ordenes-estado">
            <Form.Label>Estado</Form.Label>
            <Form.Select value={estado} onChange={(evento) => setEstado(evento.target.value)}>
              <option value="">Todos</option>
              <option value="pagada">Pagada</option>
              <option value="rechazada">Rechazada</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <p className="small text-secondary" role="status">{visibles.length} de {ordenes.length} órdenes</p>

      <Table responsive hover className="align-middle">
        <thead>
          <tr>
            <th>N.° de orden</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Entrega</th>
            <th className="text-end">Total</th>
            <th>Estado</th>
            <th><span className="visually-hidden">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {visibles.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-secondary py-4">
                {ordenes.length === 0 ? "Todavía no hay compras registradas." : "Ninguna orden coincide con la búsqueda."}
              </td>
            </tr>
          )}
          {visibles.map((orden) => (
            <tr key={orden.id}>
              <td><code>{orden.id}</code></td>
              <td className="text-nowrap">{formatearFechaHora(orden.fecha)}</td>
              <td>
                {orden.cliente.nombre} {orden.cliente.apellidos}
                <div className="small text-secondary">{orden.cliente.correo}</div>
              </td>
              <td>{etiquetaEntrega(orden.entrega.tipo)}</td>
              <td className="text-end text-nowrap">{formatearCLP(orden.total)}</td>
              <td><EstadoOrden estado={orden.estado} /></td>
              <td className="text-end text-nowrap">
                <Link
                  to={`/admin/ordenes/${orden.id}`}
                  className="btn btn-sm btn-outline-dark"
                  aria-label={`Ver boleta de la orden ${orden.id}`}
                >
                  Ver boleta
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </section>
  );
}

export default AdminOrdenes;