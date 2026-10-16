import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { obtenerProductosCriticos } from "../../services/productos";
import { nombreCategoria } from "../../utils/productos";

// Productos con stock crítico (stock igual o menor a su stock mínimo), de menor a mayor stock,
// para saber qué reponer primero.
// Props:
//   productos   -> arreglo de productos (viene de useColeccion en App)
//   categorias  -> para mostrar el nombre de la categoría
// Estado propio: la lista de críticos y si todavía se está calculando.
//
// obtenerProductosCriticos (services/productos.js) es asíncrona: recibe un "servicio" con
// listar() y devuelve una promesa. Por eso se llama dentro de un useEffect y su resultado se
// guarda en el estado. Aquí el servicio es un objeto mínimo que devuelve los productos que ya
// tiene App, de modo que la lista se recalcula sola cuando cambia el stock.
function AdminProductosCriticos({ productos, categorias }) {
  const [criticos, setCriticos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // "vigente" evita guardar un resultado viejo: si los productos cambian (o el componente se
    // desmonta) mientras la promesa está pendiente, esa respuesta se descarta.
    let vigente = true;
    obtenerProductosCriticos({ listar: () => productos }).then((lista) => {
      if (!vigente) return;
      setCriticos([...lista].sort((a, b) => a.stock - b.stock));
      setCargando(false);
    });
    return () => {
      vigente = false;
    };
  }, [productos]);

  return (
    <section aria-labelledby="titulo-admin-criticos">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 id="titulo-admin-criticos" className="h3 mb-0">Productos con stock crítico</h1>
        <Link to="/admin/productos" className="btn btn-outline-secondary">Volver al listado</Link>
      </div>

      {cargando ? (
        <p className="text-secondary" role="status">Calculando...</p>
      ) : (
        <>
          <p className="small text-secondary" role="status">
            {criticos.length === 0
              ? "No hay productos con stock crítico."
              : `${criticos.length} ${criticos.length === 1 ? "producto necesita" : "productos necesitan"} reposición.`}
          </p>
          {criticos.length > 0 && (
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="text-end">Stock</th>
                  <th className="text-end">Mínimo</th>
                  <th><span className="visually-hidden">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {criticos.map((producto) => (
                  <tr key={producto.id}>
                    <td><code>{producto.id}</code></td>
                    <td>
                      <Link to={`/admin/productos/${producto.id}`}>{producto.nombre}</Link>
                      <div className="small text-secondary">{producto.marca}</div>
                    </td>
                    <td>{nombreCategoria(categorias, producto.categoria)}</td>
                    <td className="text-end">
                      {producto.stock === 0 ? <strong>Sin stock</strong> : producto.stock}
                    </td>
                    <td className="text-end">{producto.stockMinimo}</td>
                    <td className="text-end text-nowrap">
                      {/* Reponer es editar el stock del producto. */}
                      <Link
                        to={`/admin/productos/${producto.id}/editar`}
                        className="btn btn-sm btn-outline-dark"
                        aria-label={`Reponer ${producto.nombre}`}
                      >
                        Reponer
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </section>
  );
}

export default AdminProductosCriticos;