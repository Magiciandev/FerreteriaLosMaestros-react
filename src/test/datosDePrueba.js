// Datos pequeños y fijos para las pruebas de páginas, así no dependen del catálogo real.
export const categorias = [
  { slug: "construccion", label: "Materiales de Construcción" },
  { slug: "herramientas", label: "Herramientas" },
];

export const productos = [
  { id: "MC001", nombre: "Cemento Polpaico gris 25 kg", categoria: "construccion", subcategoria: "Cementos", marca: "Polpaico", unidad: "Saco", precio: 5990, descuento: 0, stock: 80, stockMinimo: 20, imagen: null },
  { id: "HE010", nombre: "Taladro percutor 650 W", categoria: "herramientas", subcategoria: "Taladros", marca: "Bosch", unidad: "Unidad", precio: 49990, descuento: 20, stock: 4, stockMinimo: 5, imagen: null },
  { id: "HE011", nombre: "Martillo carpintero 16 oz", categoria: "herramientas", subcategoria: "Martillos", marca: "Stanley", unidad: "Unidad", precio: 8990, descuento: 10, stock: 0, stockMinimo: 3, imagen: null },
  { id: "MC004", nombre: "Mortero nivelador piso 25 kg", categoria: "construccion", subcategoria: "Morteros", marca: "Weber", unidad: "Saco", precio: 6490, descuento: 0, stock: 30, stockMinimo: 10, imagen: null },
];

export const entradasBlog = [
  { id: "B001", titulo: "Cómo elegir el cemento adecuado", resumen: "Qué mirar antes de comprar.", autor: "Equipo Los Maestros", fecha: "2026-09-12", contenido: ["Primer párrafo.", "Segundo párrafo."] },
  { id: "B002", titulo: "Herramientas básicas", resumen: "Un set mínimo para el hogar.", autor: "Equipo Los Maestros", fecha: "2026-09-26", contenido: ["Único párrafo."] },
];
