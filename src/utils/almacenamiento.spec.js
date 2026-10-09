import { guardarJSON, leerJSON } from "./almacenamiento";

// Estas pruebas usan MOCKS: en vez de leer el localStorage real del navegador,
// jasmine.spyOn reemplaza temporalmente getItem/setItem por funciones espía
// que devuelven lo que la prueba necesita y registran cómo fueron llamadas.
// Se espía Storage.prototype porque ahí viven realmente esos métodos.
describe("almacenamiento (localStorage)", () => {
  it("leerJSON devuelve el valor guardado ya convertido a objeto", () => {
    spyOn(Storage.prototype, "getItem").and.returnValue('{"nombre":"Victor"}');

    expect(leerJSON("sesionActual", null)).toEqual({ nombre: "Victor" });
  });

  it("leerJSON devuelve el valor por defecto si la clave no existe", () => {
    spyOn(Storage.prototype, "getItem").and.returnValue(null);

    expect(leerJSON("carrito", [])).toEqual([]);
  });

  it("leerJSON devuelve el valor por defecto si el contenido no es JSON válido", () => {
    spyOn(Storage.prototype, "getItem").and.returnValue("esto no es json");

    expect(leerJSON("carrito", [])).toEqual([]);
  });

  it("guardarJSON guarda el valor serializado bajo la clave indicada", () => {
    const espiaSetItem = spyOn(Storage.prototype, "setItem");

    guardarJSON("carrito", [{ idProducto: "MC001", cantidad: 2 }]);

    expect(espiaSetItem).toHaveBeenCalledWith("carrito", '[{"idProducto":"MC001","cantidad":2}]');
  });
});
