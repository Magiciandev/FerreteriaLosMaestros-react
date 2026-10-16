import { Alert, Table } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import EstadoOrden from "../../components/EstadoOrden";
import { esVenta, ordenarPorFecha } from "../../utils/estadisticas";
import { formatearCLP, formatearFecha, formatearFechaHora } from "../../utils/formato";

// Ficha de un usuario (ruta /admin/usuarios/:id) con su historial de compras.
// Props:
//   usuarios  -> arreglo de usuarios; el que se muestra se busca con el :id de la URL
//   ordenes   -> todas las órdenes; se filtran las que tienen idUsuario igual al de la ficha
//                (una compra hecha sin iniciar sesión no queda asociada a ningún usuario)
// La contraseña nunca se muestra. No tiene estado propio.
function AdminUsuarioDetalle({ usuarios, ordenes }) {
  const { id } = useParams();
  const usuario = usuarios.find((actual) => actual.id === id);

  if (!usuario) {
    return (
      <section>
        <Alert variant="warning">
          No encontramos al usuario "{id}". <Alert.Link as={Link} to="/admin/usuarios">Volver al listado</Alert.Link>
        </Alert>
      </section>
    );
  }

  const compras = ordenarPorFecha(ordenes.filter((orden) => orden.idUsuario === usuario.id));
  const aprobadas = compras.filter(esVenta);
  const gastado = aprobadas.reduce((suma, orden) => suma + orden.total, 0);

  // Pares etiqueta / valor; los vacíos (por ejemplo la dirección de un empleado) se omiten.
  const ficha = [
    ["Nombre", `${usuario.nombre} ${usuario.apellidos}`],
    ["Correo", usuario.correo],
    ["RUN", usuario.run],
    ["Rol", usuario.rol],
    ["Tipo de cliente", usuario.tipoCliente],
    ["Fecha de nacimiento", usuario.fechaNacimiento ? formatearFecha(usuario.fechaNacimiento) : ""],
    ["Región", usuario.region],
    ["Comuna", usuario.comuna],
    ["Dirección", usuario.direccion],
  ].filter(([, valor]) => valor);

  return (
    <section aria-labelledby="titulo-admin-usuario">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 id="titulo-admin-usuario" className="h3 mb-0">{usuario.nombre} {usuario.apellidos}</h1>
        <div className="d-flex gap-2">
          <Link to="/admin/usuarios" className="btn btn-outline-secondary">Volver al listado</Link>
          <Link to={`/admin/usuarios/${usuario.id}/editar`} className="btn btn-primary">Editar usuario</Link>
        </div>
      </div>

      <dl className="mb-4">
        {ficha.map(([etiqueta, valor]) => (
          <div className="row mb-2" key={etiqueta}>
            <dt className="col-sm-3">{etiqueta}</dt>
            <dd className="col-sm-9 mb-0">{valor}</dd>
          </div>
        ))}
      </dl>

      <h2 className="h5">Historial de compras</h2>
      {compras.length === 0 ? (
        <p className="text-secondary">Este usuario todavía no tiene compras.</p>
      ) : (
        <>
          <p className="small text-secondary">
            {aprobadas.length} {aprobadas.length === 1 ? "compra aprobada" : "compras aprobadas"} por un total de {formatearCLP(gastado)}.
          </p>
          <Table responsive hover size="sm" className="align-middle">
            <thead>
              <tr>
                <th>N.° de orden</th>
                <th>Fecha</th>
                <th className="text-end">Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((orden) => (
                <tr key={orden.id}>
                  <td><Link to={`/admin/ordenes/${orden.id}`}>{orden.id}</Link></td>
                  <td>{formatearFechaHora(orden.fecha)}</td>
                  <td className="text-end">{formatearCLP(orden.total)}</td>
                  <td><EstadoOrden estado={orden.estado} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </section>
  );
}

export default AdminUsuarioDetalle;