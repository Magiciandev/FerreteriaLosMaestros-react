import { formatearCLP, formatearFecha } from "./formato";

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

describe("formatearFecha", () => {
  it("escribe la fecha en español", () => {
    expect(formatearFecha("2026-09-12")).toBe("12 de septiembre de 2026");
  });

  it("no corre la fecha un día por la zona horaria", () => {
    expect(formatearFecha("2026-01-01")).toBe("1 de enero de 2026");
  });
});
