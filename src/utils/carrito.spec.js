import { productos } from "../test/datosDePrueba";
import { agregarItem, calcularTotal, cambiarCantidad, contarItems, detallarCarrito, quitarItem } from "./carrito";

describe("utils/carrito", () => {
  it("B1 agregarItem agrega un producto nuevo sin superar el stock", () => {
    expect(agregarItem([], "MC001", 100, 80)).toEqual([{ idProducto: "MC001", cantidad: 80 }]);
  });

  it("B2 agregarItem suma al producto que ya está y no toca los demás", () => {
    const carrito = [{ idProducto: "MC001", cantidad: 2 }, { idProducto: "HE010", cantidad: 1 }];
    expect(agregarItem(carrito, "MC001", 3, 80)).toEqual([
      { idProducto: "MC001", cantidad: 5 },
      { idProducto: "HE010", cantidad: 1 },
    ]);
  });

  it("B3 agregarItem devuelve el mismo carrito si la cantidad no es válida o no hay stock", () => {
    const carrito = [{ idProducto: "MC001", cantidad: 1 }];
    expect(agregarItem(carrito, "MC001", 0, 80)).toBe(carrito);
    expect(agregarItem(carrito, "MC001", 2, 0)).toBe(carrito);
  });

  it("B4 cambiarCantidad deja la cantidad entre 1 y el stock", () => {
    const carrito = [{ idProducto: "MC001", cantidad: 2 }, { idProducto: "HE010", cantidad: 1 }];
    expect(cambiarCantidad(carrito, "MC001", 99, 10)[0].cantidad).toBe(10);
    expect(cambiarCantidad(carrito, "MC001", "abc", 10)[0].cantidad).toBe(1);
    expect(cambiarCantidad(carrito, "MC001", 4, 10)[1].cantidad).toBe(1);
  });

  it("B5 quitarItem elimina solo el producto indicado", () => {
    const carrito = [{ idProducto: "MC001", cantidad: 2 }, { idProducto: "HE010", cantidad: 1 }];
    expect(quitarItem(carrito, "MC001")).toEqual([{ idProducto: "HE010", cantidad: 1 }]);
  });

  it("B6 contarItems y calcularTotal suman unidades y subtotales", () => {
    expect(contarItems([{ cantidad: 2 }, { cantidad: 3 }])).toBe(5);
    expect(calcularTotal([{ subtotal: 1000 }, { subtotal: 500 }])).toBe(1500);
  });

  it("B7 detallarCarrito reconstruye contra el catálogo, omite lo que no existe o no tiene stock y marca lo ajustado", () => {
    const carrito = [
      { idProducto: "HE010", cantidad: 9 },
      { idProducto: "HE011", cantidad: 1 },
      { idProducto: "ZZZ", cantidad: 1 },
    ];
    const lineas = detallarCarrito(carrito, productos);
    expect(lineas).toHaveLength(1);
    expect(lineas[0]).toMatchObject({ idProducto: "HE010", precioUnitario: 39992, cantidad: 4, ajustada: true });
  });
});
