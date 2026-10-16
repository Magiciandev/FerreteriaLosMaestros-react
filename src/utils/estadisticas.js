import { esStockCritico, nombreCategoria } from "./productos";

/*
 * Cálculos del dashboard y de los reportes. Son funciones puras: reciben los arreglos de
 * órdenes, productos o usuarios y devuelven números o listas, sin tocar la base de datos ni
 * la pantalla. Así las vistas solo se ocupan de mostrar el resultado.
 *
 * Criterio: solo las compras aprobadas ("pagada") cuentan como venta. Las rechazadas quedan
 * registradas en la base de datos pero no suman dinero ni unidades.
 */

export const esVenta = (orden) => orden.estado === "pagada";

// Resumen de compras: cantidad aprobada y rechazada, monto vendido y ticket promedio.
export function resumirCompras(ordenes) {
  const ventas = ordenes.filter(esVenta);
  const total = ventas.reduce((suma, orden) => suma + orden.total, 0);
  return {
    ventas: ventas.length,
    rechazadas: ordenes.length - ventas.length,
    total,
    ticketPromedio: ventas.length > 0 ? Math.round(total / ventas.length) : 0,
  };
}

// Resumen del inventario: total de productos, con stock crítico y agotados.
export function resumirProductos(productos) {
  return {
    total: productos.length,
    criticos: productos.filter(esStockCritico).length,
    sinStock: productos.filter((producto) => producto.stock === 0).length,
  };
}

// Resumen de cuentas: clientes y personal (Administrador y Vendedor).
export function resumirUsuarios(usuarios) {
  const clientes = usuarios.filter((usuario) => usuario.tipo === "cliente").length;
  return { total: usuarios.length, clientes, empleados: usuarios.length - clientes };
}

// Ordena de la más reciente a la más antigua sin modificar el arreglo original.
export function ordenarPorFecha(ordenes) {
  return [...ordenes].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

// Suma las unidades y los ingresos de cada producto en las ventas. Devuelve los que más
// unidades vendieron, hasta "limite". Los datos salen de los items de la orden (que guardan el
// nombre y el precio de ese momento), así el reporte funciona aunque el producto se haya
// eliminado después.
export function productosMasVendidos(ordenes, limite = 10) {
  const porProducto = new Map();
  for (const orden of ordenes.filter(esVenta)) {
    for (const item of orden.items) {
      const actual = porProducto.get(item.idProducto) ?? { idProducto: item.idProducto, nombre: item.nombre, unidades: 0, ingresos: 0 };
      actual.unidades += item.cantidad;
      actual.ingresos += item.subtotal;
      porProducto.set(item.idProducto, actual);
    }
  }
  return [...porProducto.values()]
    .sort((a, b) => b.unidades - a.unidades || b.ingresos - a.ingresos)
    .slice(0, limite);
}

// Ingresos y unidades por categoría, con el porcentaje que representa cada una del total. La
// categoría se busca en el producto vigente; si el producto ya no existe, va a "Producto eliminado".
export function ventasPorCategoria(ordenes, productos, categorias) {
  const porCategoria = new Map();
  for (const orden of ordenes.filter(esVenta)) {
    for (const item of orden.items) {
      const producto = productos.find((actual) => actual.id === item.idProducto);
      const slug = producto?.categoria ?? "eliminado";
      const actual = porCategoria.get(slug) ?? {
        slug,
        etiqueta: producto ? nombreCategoria(categorias, slug) : "Producto eliminado",
        unidades: 0,
        ingresos: 0,
      };
      actual.unidades += item.cantidad;
      actual.ingresos += item.subtotal;
      porCategoria.set(slug, actual);
    }
  }
  const filas = [...porCategoria.values()].sort((a, b) => b.ingresos - a.ingresos);
  const totalIngresos = filas.reduce((suma, fila) => suma + fila.ingresos, 0);
  return filas.map((fila) => ({ ...fila, porcentaje: totalIngresos > 0 ? Math.round((fila.ingresos / totalIngresos) * 100) : 0 }));
}