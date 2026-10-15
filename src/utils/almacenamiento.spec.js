import { borrarClave, guardarJSON, leerJSON } from "./almacenamiento";

// Estas pruebas usan ESPÍAS (vi.spyOn): reemplazan temporalmente getItem/setItem por funciones
// que devuelven lo que la prueba necesita y registran cómo fueron llamadas. Se espía
// Storage.prototype porque ahí viven realmente esos métodos del navegador.
describe("almacenamiento (localStorage)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("leerJSON devuelve el valor guardado ya convertido a objeto", () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue('{"nombre":"Victor"}');

    expect(leerJSON("sesionActual", null)).toEqual({ nombre: "Victor" });
  });

  it("leerJSON devuelve el valor por defecto si la clave no existe", () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);

    expect(leerJSON("carrito", [])).toEqual([]);
  });

  it("leerJSON devuelve el valor por defecto si el contenido no es JSON válido", () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("esto no es json");

    expect(leerJSON("carrito", [])).toEqual([]);
  });

  it("guardarJSON guarda el valor serializado bajo la clave indicada", () => {
    const espiaSetItem = vi.spyOn(Storage.prototype, "setItem");

    guardarJSON("carrito", [{ idProducto: "MC001", cantidad: 2 }]);

    expect(espiaSetItem).toHaveBeenCalledWith("carrito", '[{"idProducto":"MC001","cantidad":2}]');
  });

  it("borrarClave elimina la clave del almacenamiento", () => {
    const espiaRemoveItem = vi.spyOn(Storage.prototype, "removeItem");

    borrarClave("sesionActual");

    expect(espiaRemoveItem).toHaveBeenCalledWith("sesionActual");
  });
});
