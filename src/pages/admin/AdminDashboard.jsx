import { Alert, Col, Row, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import EstadoOrden from "../../components/EstadoOrden";
import TarjetaMetrica from "../../components/TarjetaMetrica";
import { formatearCLP, formatearFechaHora } from "../../utils/formato";
import { ordenarPorFecha, resumirCompras, resumirProductos, resumirUsuarios } from "../../utils/estadisticas";

// Portada del panel: las tres cifras principales (compras, productos y usuarios), un aviso si
// hay stock crítico y las últimas órdenes.
// Props:
//   productos, ordenes, usuarios  -> arreglos de la base de datos simulada
//   esAdministrador               -> el Vendedor no ve la tarjeta de usuarios ni los accesos a
//                                    secciones que no le corresponden (RF-09)
// No tiene estado propio: todo se calcula a partir de las props en cada dibujo.
function AdminDashboard({ productos, ordenes, usuarios, esAdministrador = false }) {
  const compras = resumirCompras(ordenes);
  const inventario = resumirProductos(productos);
  const cuentas = resumirUsuarios(usuarios);
  const recientes = ordenarPorFecha(ordenes).slice(0, 5);

  return (
    <section aria-labelledby="titulo-dashboard">
      <h1 id="titulo-dashboard" className="h3 mb-3">Dashboard</h1>

      {inventario.criticos > 0 && (
        <Alert variant="warning">
          {inventario.criticos} {inventario.criticos === 1 ? "producto tiene" : "productos tienen"} stock crítico.{" "}
          {esAdministrador && <Alert.Link as={Link} to="/admin/productos/criticos">Ver cuáles reponer</Alert.Link>}
        </Alert>
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
        {esAdministrador && (
          <Col xs={12} md={6} xl={4}>
            <TarjetaMetrica
              titulo="Usuarios"
              valor={cuentas.total}
              detalles={[`Clientes: ${cuentas.clientes}`, `Personal: ${cuentas.empleados}`]}
              to="/admin/usuarios"
              enlace="Ver usuarios"
            />
          </Col>
        )}
      </Row>

      <h2 className="h5">Últimas órdenes</h2>
      {recientes.length === 0 ? (
        <p className="text-secondary">Todavía no hay compras registradas.</p>
      ) : (
        <Table responsive hover size="sm" className="align-middle">
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
        </Table>
      )}
    </section>
  );
}

export default AdminDashboard;