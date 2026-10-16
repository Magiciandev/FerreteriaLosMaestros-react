import { esStockCritico, estaDisponible, nombreCategoria, precioFinal, tieneOferta } from "./productos";

// Helpers puros sobre un producto. Los objetos de prueba llevan solo los campos que cada
// función usa, para que se vea qué dato hace cambiar el resultado.
describe("helpers de producto", () => {
  describe("tieneOferta", () => {
    it("es verdadero solo cuando el descuento es mayor que 0", () => {
      expect(tieneOferta({ descuento: 15 })).toBe(true);
      expect(tieneOferta({ descuento: 0 })).toBe(false);
    });

    it("trata un producto sin el campo descuento como sin oferta", () => {
      expect(tieneOferta({})).toBe(false);
    });
  });

  describe("precioFinal", () => {
    it("descuenta el porcentaje del precio de lista", () => {
      expect(precioFinal({ precio: 10000, descuento: 25 })).toBe(7500);
    });

    it("redondea a pesos enteros", () => {
      // 5990 con 15% de descuento da 5091,5: se redondea hacia arriba.
      expect(precioFinal({ precio: 5990, descuento: 15 })).toBe(5092);
    });

    it("sin descuento devuelve el precio de lista", () => {
      expect(precioFinal({ precio: 5990, descuento: 0 })).toBe(5990);
      expect(precioFinal({ precio: 5990 })).toBe(5990);
    });
  });

  describe("estaDisponible", () => {
    it("está disponible solo si queda al menos una unidad", () => {
      expect(estaDisponible({ stock: 1 })).toBe(true);
      expect(estaDisponible({ stock: 0 })).toBe(false);
    });
  });

  describe("esStockCritico", () => {
    it("es crítico cuando el stock es igual o menor al mínimo", () => {
      expect(esStockCritico({ stock: 3, stockMinimo: 5 })).toBe(true);
      expect(esStockCritico({ stock: 5, stockMinimo: 5 })).toBe(true);
      expect(esStockCritico({ stock: 6, stockMinimo: 5 })).toBe(false);
    });

    it("sin stock mínimo definido nunca es crítico", () => {
      expect(esStockCritico({ stock: 0, stockMinimo: null })).toBe(false);
    });
  });

  describe("nombreCategoria", () => {
    const categorias = [{ slug: "gasfiteria", label: "Gasfitería" }];

    it("devuelve el nombre de la categoría a partir de su slug", () => {
      expect(nombreCategoria(categorias, "gasfiteria")).toBe("Gasfitería");
    });

    it("si el slug no existe devuelve el mismo slug, en vez de fallar", () => {
      expect(nombreCategoria(categorias, "desconocida")).toBe("desconocida");
    });
  });
});