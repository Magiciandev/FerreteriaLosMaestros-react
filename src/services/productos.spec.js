import { obtenerProductosCriticos } from "./productos";

const productos = [
  { id: "A", stock: 5, stockMinimo: 5 },
  { id: "B", stock: 50, stockMinimo: 5 },
  { id: "C", stock: 0, stockMinimo: 2 },
];

// Estas pruebas usan un MOCK de servicio: un objeto falso con listar() controlado por la prueba,
// de modo que no se toca la base de datos real. mockResolvedValue hace que listar() devuelva
// una promesa que se resuelve con el arreglo indicado, como lo haría un servicio asíncrono.
describe("obtenerProductosCriticos", () => {
  it("devuelve solo los productos con stock crítico", async () => {
    const servicio = { listar: vi.fn().mockResolvedValue(productos) };

    const criticos = await obtenerProductosCriticos(servicio);

    expect(criticos.map((producto) => producto.id)).toEqual(["A", "C"]);
    expect(servicio.listar).toHaveBeenCalledTimes(1);
  });

  it("también funciona con un servicio síncrono", async () => {
    const servicio = { listar: vi.fn().mockReturnValue(productos) };

    expect(await obtenerProductosCriticos(servicio)).toHaveLength(2);
  });

  it("propaga el error cuando el servicio falla", async () => {
    const servicio = { listar: vi.fn().mockRejectedValue(new Error("sin conexión")) };

    await expect(obtenerProductosCriticos(servicio)).rejects.toThrow("sin conexión");
  });
});
