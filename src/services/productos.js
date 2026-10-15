import { esStockCritico } from "../utils/productos";

// Recibe el "servicio" (cualquier objeto con un método listar()) en vez de importar la base de
// datos directamente. Así la función se puede probar con un servicio falso y funciona igual si
// listar() devuelve el arreglo directo o una promesa.
export async function obtenerProductosCriticos(servicio) {
  const productos = await servicio.listar();
  return productos.filter(esStockCritico);
}
