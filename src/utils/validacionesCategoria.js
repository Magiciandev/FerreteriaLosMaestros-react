/*
 * Validaciones del formulario de categorías del panel de administración.
 * Siguen la misma regla que utils/validaciones.js: devuelven "" si el valor es válido o el
 * mensaje de error que se muestra junto al campo.
 */

const texto = (valor) => String(valor ?? "").trim();

// El identificador (slug) de una categoría cumple dos funciones: aparece en la dirección de la
// tienda (/categorias/gasfiteria) y cada producto lo guarda en su campo "categoria". Por eso solo
// admite minúsculas, números y guiones sueltos entre palabras, sin espacios ni tildes.
export function validarSlugCategoria(valor) {
  const dato = texto(valor);
  const formatoValido = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(dato);
  return formatoValido && dato.length >= 3 && dato.length <= 30
    ? ""
    : "Identificador inválido: usa entre 3 y 30 caracteres, solo minúsculas, números y guiones (ej: pinturas-y-barnices).";
}

// El nombre es el texto que ve el cliente en el menú y en las tarjetas.
export function validarNombreCategoria(valor) {
  const largo = texto(valor).length;
  return largo > 0 && largo <= 60 ? "" : "El nombre es obligatorio (máximo 60 caracteres).";
}