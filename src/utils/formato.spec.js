import { formatearCLP } from "./formato";

describe("formatearCLP", () => {
  it("agrega el símbolo $ y el punto como separador de miles", () => {
    expect(formatearCLP(5990)).toBe("$5.990");
  });

  it("muestra $0 cuando el valor es cero", () => {
    expect(formatearCLP(0)).toBe("$0");
  });

  it("redondea a pesos enteros, sin decimales", () => {
    expect(formatearCLP(1999.6)).toBe("$2.000");
  });
});
