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

// La ruta de la imagen viene sin "/" inicial ("assets/img/..."); con rutas anidadas como
// /productos/MC001 el navegador la buscaría en el lugar equivocado, por eso se agrega.
export function rutaImagen(producto) {
  return producto.imagen ? `/${producto.imagen.replace(/^\//, "")}` : null;
}

// Pasa a minúsculas y quita las tildes: así "gasfiteria" encuentra "Gasfitería".
export function normalizarTexto(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Filtra por categoría, por "solo ofertas" y por texto. El texto se busca en nombre, marca,
// subcategoría y código; si trae varias palabras, el producto debe contener todas.
export function filtrarProductos(productos, { texto = "", categoria = "", soloOfertas = false } = {}) {
  const palabras = normalizarTexto(texto).split(/\s+/).filter(Boolean);
  return productos.filter((producto) => {
    if (categoria && producto.categoria !== categoria) return false;
    if (soloOfertas && !tieneOferta(producto)) return false;
    if (palabras.length === 0) return true;
    const contenido = normalizarTexto(
      [producto.nombre, producto.marca, producto.subcategoria, producto.id].join(" ")
    );
    return palabras.every((palabra) => contenido.includes(palabra));
  });
}

// Productos con descuento, de mayor a menor descuento.
export function productosEnOferta(productos) {
  return productos.filter(tieneOferta).sort((a, b) => b.descuento - a.descuento);
}
