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
