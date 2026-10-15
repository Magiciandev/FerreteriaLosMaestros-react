import { precioFinal } from "./productos";

// Lógica pura del carrito. El carrito es un arreglo de { idProducto, cantidad } y estas
// funciones devuelven un arreglo NUEVO en vez de modificar el original: React solo vuelve a
// dibujar cuando el estado cambia por una referencia distinta.

// Agrega "cantidad" unidades de un producto sin superar su stock.
// Si la cantidad no es válida o no hay stock, devuelve el carrito sin cambios.
export function agregarItem(carrito, idProducto, cantidad, stock) {
  const unidades = Math.floor(Number(cantidad));
  if (!(unidades > 0) || !(stock > 0)) return carrito;

  const existente = carrito.find((item) => item.idProducto === idProducto);
  if (!existente) {
    return [...carrito, { idProducto, cantidad: Math.min(unidades, stock) }];
  }
  return carrito.map((item) =>
    item.idProducto === idProducto
      ? { ...item, cantidad: Math.min(item.cantidad + unidades, stock) }
      : item
  );
}

// Total de unidades en el carrito (el número que muestra el encabezado).
export function contarItems(carrito) {
  return carrito.reduce((total, item) => total + item.cantidad, 0);
}

// Cambia la cantidad de un producto del carrito, dejándola entre 1 y su stock.
export function cambiarCantidad(carrito, idProducto, cantidad, stock) {
  const unidades = Math.min(Math.max(Math.floor(Number(cantidad)) || 1, 1), Math.max(stock, 1));
  return carrito.map((item) => (item.idProducto === idProducto ? { ...item, cantidad: unidades } : item));
}

export function quitarItem(carrito, idProducto) {
  return carrito.filter((item) => item.idProducto !== idProducto);
}

// El carrito solo guarda { idProducto, cantidad }. Para mostrarlo se reconstruye contra el
// catálogo vigente: así el precio, el nombre y el stock siempre están al día.
//   - Un producto que ya no existe o quedó sin stock se omite.
//   - Si la cantidad guardada supera el stock actual, se baja al stock y la línea queda
//     marcada con ajustada: true para poder avisárselo a la persona.
// Cada línea tiene la forma de un ítem de orden (idProducto, nombre, precioUnitario, cantidad,
// subtotal) más el stock disponible; el precio unitario ya incluye el descuento de la oferta.
export function detallarCarrito(carrito, productos) {
  const lineas = [];
  for (const item of carrito) {
    const producto = productos.find((candidato) => candidato.id === item.idProducto);
    if (!producto || producto.stock <= 0) continue;
    const cantidad = Math.min(item.cantidad, producto.stock);
    const precioUnitario = precioFinal(producto);
    lineas.push({
      idProducto: producto.id,
      nombre: producto.nombre,
      precioUnitario,
      cantidad,
      subtotal: precioUnitario * cantidad,
      stock: producto.stock,
      ajustada: cantidad < item.cantidad,
    });
  }
  return lineas;
}

export function calcularTotal(lineas) {
  return lineas.reduce((total, linea) => total + linea.subtotal, 0);
}
