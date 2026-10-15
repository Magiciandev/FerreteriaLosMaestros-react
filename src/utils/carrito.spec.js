import { agregarItem, contarItems } from "./carrito";

describe("agregarItem", () => {
  it("agrega un producto nuevo con la cantidad pedida", () => {
    expect(agregarItem([], "MC001", 2, 80)).toEqual([{ idProducto: "MC001", cantidad: 2 }]);
  });

  it("suma la cantidad si el producto ya estaba en el carrito", () => {
    const carrito = [{ idProducto: "MC001", cantidad: 2 }];
    expect(agregarItem(carrito, "MC001", 3, 80)).toEqual([{ idProducto: "MC001", cantidad: 5 }]);
  });

  it("no supera el stock disponible", () => {
    const carrito = [{ idProducto: "MC001", cantidad: 4 }];
    expect(agregarItem(carrito, "MC001", 10, 5)).toEqual([{ idProducto: "MC001", cantidad: 5 }]);
    expect(agregarItem([], "MC001", 10, 5)).toEqual([{ idProducto: "MC001", cantidad: 5 }]);
  });

  it("ignora cantidades inválidas y productos sin stock", () => {
    const carrito = [{ idProducto: "A", cantidad: 1 }];
    expect(agregarItem(carrito, "B", 0, 10)).toBe(carrito);
    expect(agregarItem(carrito, "B", -2, 10)).toBe(carrito);
    expect(agregarItem(carrito, "B", "abc", 10)).toBe(carrito);
    expect(agregarItem(carrito, "B", 1, 0)).toBe(carrito);
  });

  it("devuelve un arreglo nuevo sin modificar el original", () => {
    const carrito = [{ idProducto: "A", cantidad: 1 }];
    const resultado = agregarItem(carrito, "A", 1, 10);
    expect(resultado).not.toBe(carrito);
    expect(carrito[0].cantidad).toBe(1);
  });
});

describe("contarItems", () => {
  it("suma las unidades de todos los productos", () => {
    expect(contarItems([{ idProducto: "A", cantidad: 2 }, { idProducto: "B", cantidad: 3 }])).toBe(5);
  });

  it("devuelve 0 con el carrito vacío", () => {
    expect(contarItems([])).toBe(0);
  });
});
