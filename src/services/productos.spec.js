import { obtenerProductosCriticos } from "./productos";

const productos = [
  { id: "A", stock: 5, stockMinimo: 5 },
  { id: "B", stock: 50, stockMinimo: 5 },
  { id: "C", stock: 0, stockMinimo: 2 },
];

describe("obtenerProductosCriticos", () => {
  it("A5 devuelve solo los productos con stock crítico usando un servicio simulado", async () => {
    const servicio = { listar: vi.fn().mockResolvedValue(productos) };
    const criticos = await obtenerProductosCriticos(servicio);
    expect(criticos.map((p) => p.id)).toEqual(["A", "C"]);
    expect(servicio.listar).toHaveBeenCalledTimes(1);
  });
});
