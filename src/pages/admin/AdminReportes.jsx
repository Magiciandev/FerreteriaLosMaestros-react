import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import TarjetaMetrica from "../../components/TarjetaMetrica";
import { productosMasVendidos, resumirCompras, resumirProductos, ventasPorCategoria } from "../../utils/estadisticas";
import { formatearCLP } from "../../utils/formato";

// Reportes de ventas e inventario (solo Administrador), calculados con las órdenes aprobadas.
// Props:
//   ordenes, productos, categorias -> arreglos de la base de datos simulada
// No tiene estado propio. Los cálculos viven en utils/estadisticas.js; esta página solo los
// muestra en tarjetas y tablas.
function AdminReportes({ ordenes, productos, categorias }) {
  const compras = resumirCompras(ordenes);
  const inventario = resumirProductos(productos);
  const masVendidos = productosMasVendidos(ordenes, 10);
  const porCategoria = ventasPorCategoria(ordenes, productos, categorias);

  return (
    <section aria-labelledby="titulo-admin-reportes">
      <h1 id="titulo-admin-reportes" className="h3 mb-1">Reportes</h1>
      <p className="text-secondary">Solo cuentan las compras aprobadas; las rechazadas no se consideran ventas.</p>

      <Row className="g-3 mb-4">
        <Col xs={12} md={4}>
          <TarjetaMetrica titulo="Ventas aprobadas" valor={compras.ventas} detalles={[`Rechazadas: ${compras.rechazadas}`]} />
        </Col>
        <Col xs={12} md={4}>
          <TarjetaMetrica titulo="Monto vendido" valor={formatearCLP(compras.total)} detalles={[`Ticket promedio: ${formatearCLP(compras.ticketPromedio)}`]} />
        </Col>
        <Col xs={12} md={4}>
          <TarjetaMetrica
            titulo="Stock crítico"
            valor={inventario.criticos}
            detalles={[`Sin stock: ${inventario.sinStock} de ${inventario.total} productos`]}
            to="/admin/productos/criticos"
            enlace="Ver productos a reponer"
          />
        </Col>
      </Row>

      {compras.ventas === 0 ? (
        <p className="text-secondary">
          Todavía no hay compras aprobadas, así que no hay ventas que reportar. Cuando se registren,
          aparecerán aquí los productos más vendidos y las ventas por categoría.
        </p>
      ) : (
        <>
          <h2 className="h5">Productos más vendidos</h2>
          <div className="table-responsive">
            <table className="table table-hover table-sm align-middle mb-4">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th className="text-end">Unidades</th>
                  <th className="text-end">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {masVendidos.map((fila, posicion) => (
                  <tr key={fila.idProducto}>
                    <td>{posicion + 1}</td>
                    <td>
                      {/* Si el producto ya no existe, el nombre queda como texto sin enlace. */}
                      {productos.some((producto) => producto.id === fila.idProducto)
                        ? <Link to={`/admin/productos/${fila.idProducto}`}>{fila.nombre}</Link>
                        : fila.nombre}
                    </td>
                    <td className="text-end">{fila.unidades}</td>
                    <td className="text-end">{formatearCLP(fila.ingresos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="h5">Ventas por categoría</h2>
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th className="text-end">Unidades</th>
                  <th className="text-end">Ingresos</th>
                  <th style={{ minWidth: "10rem" }}>Participación</th>
                </tr>
              </thead>
              <tbody>
                {porCategoria.map((fila) => (
                  <tr key={fila.slug}>
                    <td>{fila.etiqueta}</td>
                    <td className="text-end">{fila.unidades}</td>
                    <td className="text-end">{formatearCLP(fila.ingresos)}</td>
                    <td>
                      <div className="progress" role="progressbar" aria-label={`${fila.etiqueta}: ${fila.porcentaje}% de los ingresos`} aria-valuenow={fila.porcentaje} aria-valuemin={0} aria-valuemax={100}>
                        <div className="progress-bar" style={{ width: `${fila.porcentaje}%` }}>{`${fila.porcentaje}%`}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default AdminReportes;