import {
  esStockCritico,
  estaDisponible,
  filtrarProductos,
  nombreCategoria,
  normalizarTexto,
  precioFinal,
  productosEnOferta,
  rutaImagen,
  tieneOferta,
} from "./productos";

const catalogo = [
  { id: "MC001", nombre: "Cemento Polpaico gris 25 kg", categoria: "construccion", subcategoria: "Cementos", marca: "Polpaico", precio: 5990, descuento: 0, stock: 80, stockMinimo: 20 },
  { id: "HE010", nombre: "Taladro percutor 650 W", categoria: "herramientas", subcategoria: "Taladros", marca: "Bosch", precio: 49990, descuento: 20, stock: 4, stockMinimo: 5 },
  { id: "GA003", nombre: "Tubo PVC 110 mm", categoria: "gasfiteria", subcategoria: "Tuberías", marca: "Vinilit", precio: 3990, descuento: 10, stock: 0, stockMinimo: 3 },
];

describe("precioFinal", () => {
  it("aplica el porcentaje de descuento y redondea a pesos enteros", () => {
    expect(precioFinal({ precio: 5990, descuento: 10 })).toBe(5391);
  });

  it("devuelve el precio de lista cuando no hay descuento", () => {
    expect(precioFinal({ precio: 5990, descuento: 0 })).toBe(5990);
    expect(precioFinal({ precio: 5990 })).toBe(5990);
  });
});

describe("estado del producto", () => {
  it("tieneOferta es verdadero solo con descuento mayor a cero", () => {
    expect(tieneOferta({ descuento: 15 })).toBe(true);
    expect(tieneOferta({ descuento: 0 })).toBe(false);
  });

  it("estaDisponible depende de que quede stock", () => {
    expect(estaDisponible({ stock: 1 })).toBe(true);
    expect(estaDisponible({ stock: 0 })).toBe(false);
  });

  it("esStockCritico es verdadero cuando el stock llega al mínimo o baja de él", () => {
    expect(esStockCritico({ stock: 5, stockMinimo: 5 })).toBe(true);
    expect(esStockCritico({ stock: 6, stockMinimo: 5 })).toBe(false);
    expect(esStockCritico({ stock: 1 })).toBe(false);
  });
});

describe("nombreCategoria y rutaImagen", () => {
  it("busca el nombre de la categoría por su slug y, si no existe, devuelve el slug", () => {
    const categorias = [{ slug: "herramientas", label: "Herramientas" }];
    expect(nombreCategoria(categorias, "herramientas")).toBe("Herramientas");
    expect(nombreCategoria(categorias, "otra")).toBe("otra");
  });

  it("rutaImagen agrega la barra inicial y devuelve null si no hay imagen", () => {
    expect(rutaImagen({ imagen: "assets/img/productos/a.jpg" })).toBe("/assets/img/productos/a.jpg");
    expect(rutaImagen({ imagen: "/assets/a.jpg" })).toBe("/assets/a.jpg");
    expect(rutaImagen({ imagen: null })).toBeNull();
  });
});

describe("filtrarProductos", () => {
  it("sin filtros devuelve todos los productos", () => {
    expect(filtrarProductos(catalogo)).toHaveLength(3);
  });

  it("busca por texto ignorando mayúsculas y tildes", () => {
    expect(filtrarProductos(catalogo, { texto: "TUBERIAS" }).map((p) => p.id)).toEqual(["GA003"]);
  });

  it("busca por marca y por código", () => {
    expect(filtrarProductos(catalogo, { texto: "bosch" }).map((p) => p.id)).toEqual(["HE010"]);
    expect(filtrarProductos(catalogo, { texto: "mc001" }).map((p) => p.id)).toEqual(["MC001"]);
  });

  it("con varias palabras exige que el producto las contenga todas", () => {
    expect(filtrarProductos(catalogo, { texto: "cemento gris" })).toHaveLength(1);
    expect(filtrarProductos(catalogo, { texto: "cemento taladro" })).toHaveLength(0);
  });

  it("filtra por categoría y por solo ofertas, y combina los filtros", () => {
    expect(filtrarProductos(catalogo, { categoria: "herramientas" })).toHaveLength(1);
    expect(filtrarProductos(catalogo, { soloOfertas: true })).toHaveLength(2);
    expect(filtrarProductos(catalogo, { categoria: "construccion", soloOfertas: true })).toHaveLength(0);
  });
});

describe("productosEnOferta", () => {
  it("devuelve solo los productos con descuento, de mayor a menor", () => {
    expect(productosEnOferta(catalogo).map((p) => p.id)).toEqual(["HE010", "GA003"]);
  });

  it("no modifica el arreglo original", () => {
    const copia = [...catalogo];
    productosEnOferta(catalogo);
    expect(catalogo).toEqual(copia);
  });
});

describe("normalizarTexto", () => {
  it("quita tildes, pasa a minúsculas y recorta espacios", () => {
    expect(normalizarTexto("  Gasfitería ")).toBe("gasfiteria");
    expect(normalizarTexto(null)).toBe("");
  });
});
