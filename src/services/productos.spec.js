import { obtenerProductosCriticos } from "./productos";

const productos = [
  { id: "A", stock: 5, stockMinimo: 5 },
  { id: "B", stock: 50, stockMinimo: 5 },
  { id: "C", stock: 0, stockMinimo: 2 },
];

describe("obtenerProductosCriticos", () => {
  // MOCK ASÍNCRONO: un servicio falso con listar() controlado por la prueba. mockResolvedValue
  // hace que listar() devuelva una promesa resuelta, como lo haría un servicio real.
  it("[B2] devuelve solo los productos con stock crítico usando un servicio simulado", async () => {
    const servicio = { listar: vi.fn().mockResolvedValue(productos) };

    const criticos = await obtenerProductosCriticos(servicio);

    expect(criticos.map((producto) => producto.id)).toEqual(["A", "C"]);
    expect(servicio.listar).toHaveBeenCalledTimes(1);
  });
});
