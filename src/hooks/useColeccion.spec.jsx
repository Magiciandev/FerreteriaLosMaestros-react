import { act, renderHook } from "@testing-library/react";
import { crearColeccion } from "../data/coleccion";
import { useColeccion } from "./useColeccion";

const semilla = [{ id: "P001", nombre: "Uno" }];

// Se prueba el HOOK sin necesidad de un componente: renderHook lo ejecuta dentro de uno
// invisible y act() agrupa los cambios de estado, como haría React al responder a un clic.
describe("useColeccion", () => {
  let coleccion;

  beforeEach(() => {
    localStorage.clear();
    coleccion = crearColeccion({ clave: "prueba-hook", semilla, prefijoId: "P" });
  });

  it("parte con los registros que ya hay en la base de datos", () => {
    const { result } = renderHook(() => useColeccion(coleccion));

    expect(result.current.items).toEqual(semilla);
  });

  it("crear guarda en la base de datos y actualiza la lista en pantalla", () => {
    const { result } = renderHook(() => useColeccion(coleccion));

    act(() => {
      result.current.crear({ nombre: "Dos" });
    });

    expect(result.current.items).toHaveLength(2);
    expect(coleccion.listar()).toHaveLength(2);
  });

  it("actualizar cambia el registro y la lista", () => {
    const { result } = renderHook(() => useColeccion(coleccion));

    act(() => {
      result.current.actualizar("P001", { nombre: "Cambiado" });
    });

    expect(result.current.items[0].nombre).toBe("Cambiado");
  });

  it("eliminar quita el registro de la base de datos y de la lista", () => {
    const { result } = renderHook(() => useColeccion(coleccion));

    act(() => {
      result.current.eliminar("P001");
    });

    expect(result.current.items).toEqual([]);
    expect(coleccion.listar()).toEqual([]);
  });

  it("si crear falla por un id repetido, el error llega a quien lo llamó y la lista no cambia", () => {
    const { result } = renderHook(() => useColeccion(coleccion));

    expect(() => result.current.crear({ id: "P001" })).toThrow();
    expect(result.current.items).toHaveLength(1);
  });
});
