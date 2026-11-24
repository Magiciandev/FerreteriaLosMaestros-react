import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import EstadoOrden from "../../components/EstadoOrden";
import TarjetaMetrica from "../../components/TarjetaMetrica";
import { formatearCLP, formatearFechaHora } from "../../utils/formato";
import { ordenarPorFecha, resumirCompras, resumirProductos, resumirUsuarios } from "../../utils/estadisticas";

// Portada del panel: las tres cifras principales (compras, productos y usuarios), un aviso si
// hay stock crítico y las últimas órdenes.
// Props:
//   productos, ordenes, usuarios  -> arreglos de la base de datos simulada
// No tiene estado propio: todo se calcula a partir de las props en cada dibujo.
function AdminDashboard({ productos, ordenes, usuarios }) {
  const compras = resumirCompras(ordenes);
  const inventario = resumirProductos(productos);
  const cuentas = resumirUsuarios(usuarios);
  const recientes = ordenarPorFecha(ordenes).slice(0, 5);

  return (
    <section aria-labelledby="titulo-dashboard">
      <h1 id="titulo-dashboard" className="h3 mb-3">Dashboard</h1>

      {inventario.criticos > 0 && (
        <div className="alert alert-warning">
          {inventario.criticos} {inventario.criticos === 1 ? "producto tiene" : "productos tienen"} stock crítico.{" "}
          <Link to="/admin/productos/criticos" className="alert-link">Ver cuáles reponer</Link>
        </div>
      )}

      <Row className="g-3 mb-4">
        <Col xs={12} md={6} xl={4}>
          <TarjetaMetrica
            titulo="Compras aprobadas"
            valor={compras.ventas}
            detalles={[
              `Vendido: ${formatearCLP(compras.total)}`,
              `Ticket promedio: ${formatearCLP(compras.ticketPromedio)}`,
              `Rechazadas: ${compras.rechazadas}`,
            ]}
            to="/admin/ordenes"
            enlace="Ver órdenes"
          />
        </Col>
        <Col xs={12} md={6} xl={4}>
          <TarjetaMetrica
            titulo="Productos"
            valor={inventario.total}
            detalles={[`Con stock crítico: ${inventario.criticos}`, `Sin stock: ${inventario.sinStock}`]}
            to="/admin/productos"
            enlace="Ver productos"
          />
        </Col>
        <Col xs={12} md={6} xl={4}>
          <TarjetaMetrica
            titulo="Usuarios"
            valor={cuentas.total}
            detalles={[`Clientes: ${cuentas.clientes}`, `Personal: ${cuentas.empleados}`]}
            to="/admin/usuarios"
            enlace="Ver usuarios"
          />
        </Col>
      </Row>

      <h2 className="h5">Últimas órdenes</h2>
      {recientes.length === 0 ? (
        <p className="text-secondary">Todavía no hay compras registradas.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-sm align-middle">
            <thead>
              <tr>
                <th>N.° de orden</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th className="text-end">Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {recientes.map((orden) => (
                <tr key={orden.id}>
                  <td><Link to={`/admin/ordenes/${orden.id}`}>{orden.id}</Link></td>
                  <td>{formatearFechaHora(orden.fecha)}</td>
                  <td>{orden.cliente.nombre} {orden.cliente.apellidos}</td>
                  <td className="text-end">{formatearCLP(orden.total)}</td>
                  <td><EstadoOrden estado={orden.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminDashboard;