import { Alert, Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import EstadoOrden from "../../components/EstadoOrden";
import ResumenOrden from "../../components/ResumenOrden";
import { formatearFechaHora } from "../../utils/formato";

// Boleta de una orden dentro del panel (ruta /admin/ordenes/:id). Reutiliza ResumenOrden, el
// mismo componente que muestra la boleta al cliente después de pagar.
// Props:
//   ordenes          -> arreglo de órdenes; la que se muestra se busca con el :id de la URL
//   esAdministrador  -> solo el Administrador ve el enlace a la ficha del cliente
// Al imprimir, la clase "no-imprimir" oculta los botones y el menú del panel (ver index.css).
function AdminOrdenDetalle({ ordenes, esAdministrador = false }) {
  const { id } = useParams();
  const orden = ordenes.find((actual) => actual.id === id);

  if (!orden) {
    return (
      <section>
        <Alert variant="warning">
          No encontramos la orden "{id}". <Alert.Link as={Link} to="/admin/ordenes">Volver a las órdenes</Alert.Link>
        </Alert>
      </section>
    );
  }

  return (
    <section aria-labelledby="titulo-admin-orden" className="boleta">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 id="titulo-admin-orden" className="h3 mb-0">
          Boleta N.° {orden.id} <EstadoOrden estado={orden.estado} />
        </h1>
        <div className="d-flex flex-wrap gap-2 no-imprimir">
          <Link to="/admin/ordenes" className="btn btn-outline-secondary">Volver a las órdenes</Link>
          {esAdministrador && orden.idUsuario && (
            <Link to={`/admin/usuarios/${orden.idUsuario}`} className="btn btn-outline-dark">Ver cliente</Link>
          )}
          <Button variant="primary" onClick={() => window.print()}>Imprimir boleta</Button>
        </div>
      </div>

      <p className="text-secondary">Fecha: {formatearFechaHora(orden.fecha)}</p>

      {orden.estado === "rechazada" && (
        <Alert variant="danger">El pago fue rechazado: no se cobró ni se descontó stock.</Alert>
      )}

      <ResumenOrden orden={orden} />
    </section>
  );
}

export default AdminOrdenDetalle;