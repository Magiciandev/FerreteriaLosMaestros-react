import { productos } from "../test/datosDePrueba";
import { esStockCritico, estaDisponible, filtrarProductos, precioFinal } from "./productos";

describe("utils/productos", () => {
  it("A1 precioFinal aplica el descuento y deja pesos enteros", () => {
    expect(precioFinal({ precio: 49990, descuento: 20 })).toBe(39992);
    expect(precioFinal({ precio: 5990, descuento: 0 })).toBe(5990);
  });

  it("A2 interpreta el stock: crítico y disponible", () => {
    expect(esStockCritico(productos[1])).toBe(true);
    expect(esStockCritico(productos[0])).toBe(false);
    expect(esStockCritico({ stock: 1 })).toBe(false);
    expect(estaDisponible(productos[2])).toBe(false);
  });

  it("A3 filtrarProductos busca por texto sin tildes ni mayúsculas y por categoría", () => {
    expect(filtrarProductos(productos, { texto: "POLPAICÓ" }).map((p) => p.id)).toEqual(["MC001"]);
    expect(filtrarProductos(productos, { categoria: "construccion" })).toHaveLength(2);
  });

  it("A4 filtrarProductos deja solo las ofertas o no filtra nada", () => {
    expect(filtrarProductos(productos, { soloOfertas: true }).map((p) => p.id)).toEqual(["HE010", "HE011"]);
    expect(filtrarProductos(productos)).toHaveLength(4);
  });
});
