// El producto guarda solo el slug de su categoría; el nombre se busca en la lista de categorías.
export function nombreCategoria(categorias, slug) {
  return categorias.find((categoria) => categoria.slug === slug)?.label ?? slug;
}
