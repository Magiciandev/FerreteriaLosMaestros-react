import { precioFinal } from "./productos";

describe("productos (funciones puras)", () => {
  it("[A1] precioFinal aplica el porcentaje de descuento y redondea a pesos enteros", () => {
    expect(precioFinal({ precio: 5990, descuento: 10 })).toBe(5391);
    expect(precioFinal({ precio: 5990, descuento: 0 })).toBe(5990);
  });
});
