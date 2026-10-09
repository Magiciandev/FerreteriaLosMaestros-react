// Funciones de apoyo sobre un producto { precio, descuento, stock, stockMinimo, categoria }.

export function tieneOferta(producto) {
  return Number(producto.descuento) > 0;
}

// Precio que paga el cliente: el precio de lista menos el descuento, a pesos enteros.
export function precioFinal(producto) {
  const descuento = Number(producto.descuento) || 0;
  return Math.round(producto.precio * (1 - descuento / 100));
}

export function estaDisponible(producto) {
  return producto.stock > 0;
}

// Stock crítico: queda el mínimo definido o menos.
export function esStockCritico(producto) {
  return producto.stockMinimo != null && producto.stock <= producto.stockMinimo;
}

// El producto guarda solo el slug de su categoría; el nombre se busca en la lista de categorías.
export function nombreCategoria(categorias, slug) {
  return categorias.find((categoria) => categoria.slug === slug)?.label ?? slug;
}
