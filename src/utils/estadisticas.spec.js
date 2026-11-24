import { categorias, productos } from "../test/datosDePrueba";
import {
  ordenarPorFecha, productosMasVendidos, resumirCompras, resumirProductos, resumirUsuarios, ventasPorCategoria,
} from "./estadisticas";

const pagada1 = {
  id: "ORD-0001", estado: "pagada", total: 51972, fecha: "2026-10-02T10:00:00.000Z",
  items: [
    { idProducto: "MC001", nombre: "Cemento", cantidad: 2, subtotal: 11980 },
    { idProducto: "HE010", nombre: "Taladro", cantidad: 1, subtotal: 39992 },
  ],
};
const pagada2 = {
  id: "ORD-0002", estado: "pagada", total: 8990, fecha: "2026-10-03T10:00:00.000Z",
  items: [
    { idProducto: "MC001", nombre: "Cemento", cantidad: 1, subtotal: 5990 },
    { idProducto: "ZZZ", nombre: "Producto borrado", cantidad: 1, subtotal: 3000 },
  ],
};
const rechazada = { id: "ORD-0003", estado: "rechazada", total: 1000, fecha: "2026-10-01T09:00:00.000Z", items: [] };
const ordenes = [pagada1, pagada2, rechazada];

describe("utils/estadisticas", () => {
  it("C1 resumirCompras cuenta como venta solo las compras aprobadas", () => {
    expect(resumirCompras(ordenes)).toEqual({ ventas: 2, rechazadas: 1, total: 60962, ticketPromedio: 30481 });
    expect(resumirCompras([rechazada])).toEqual({ ventas: 0, rechazadas: 1, total: 0, ticketPromedio: 0 });
  });

  it("C2 resumirProductos y resumirUsuarios entregan los totales del dashboard", () => {
    expect(resumirProductos(productos)).toEqual({ total: 4, criticos: 2, sinStock: 1 });
    const usuarios = [{ rol: "CLIENTE" }, { rol: "ADMIN" }, { rol: "CLIENTE" }];
    expect(resumirUsuarios(usuarios)).toEqual({ total: 3, clientes: 2, empleados: 1 });
  });

  it("C3 ordenarPorFecha pone primero lo más reciente sin modificar la lista original", () => {
    const original = [...ordenes];
    expect(ordenarPorFecha(ordenes).map((orden) => orden.id)).toEqual(["ORD-0002", "ORD-0001", "ORD-0003"]);
    expect(ordenes).toEqual(original);
  });

  it("C4 productosMasVendidos suma por producto, desempata por ingresos y respeta el límite", () => {
    const ranking = productosMasVendidos(ordenes);
    expect(ranking.map((fila) => [fila.idProducto, fila.unidades])).toEqual([["MC001", 3], ["HE010", 1], ["ZZZ", 1]]);
    expect(productosMasVendidos(ordenes, 2)).toHaveLength(2);
  });

  it("C5 ventasPorCategoria reparte los ingresos en porcentajes e identifica productos eliminados", () => {
    const filas = ventasPorCategoria(ordenes, productos, categorias);
    expect(filas.map((fila) => [fila.etiqueta, fila.porcentaje])).toEqual([
      ["Herramientas", 66], ["Materiales de Construcción", 29], ["Producto eliminado", 5],
    ]);
    const sinIngresos = [{ estado: "pagada", items: [{ idProducto: "MC001", nombre: "x", cantidad: 1, subtotal: 0 }] }];
    expect(ventasPorCategoria(sinIngresos, productos, categorias)[0].porcentaje).toBe(0);
  });
});
