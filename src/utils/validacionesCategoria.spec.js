import { validarNombreCategoria, validarSlugCategoria } from "./validacionesCategoria";

describe("validarSlugCategoria", () => {
  it.each(["madera", "pinturas-y-barnices", "ofertas2026", "a1b"])("acepta '%s'", (slug) => {
    expect(validarSlugCategoria(slug)).toBe("");
  });

  it.each([
    ["vacío", ""],
    ["demasiado corto", "ab"],
    ["con mayúsculas", "Madera"],
    ["con espacios", "madera y tableros"],
    ["con tilde", "jardín"],
    ["con guion al inicio", "-madera"],
    ["con guion al final", "madera-"],
    ["con guiones seguidos", "madera--tableros"],
    ["de más de 30 caracteres", "a".repeat(31)],
  ])("rechaza un identificador %s", (_descripcion, slug) => {
    expect(validarSlugCategoria(slug)).toContain("Identificador inválido");
  });

  it("ignora los espacios al inicio y al final", () => {
    expect(validarSlugCategoria("  madera  ")).toBe("");
  });
});

describe("validarNombreCategoria", () => {
  it("acepta un nombre de hasta 60 caracteres", () => {
    expect(validarNombreCategoria("Jardín y Exterior")).toBe("");
    expect(validarNombreCategoria("a".repeat(60))).toBe("");
  });

  it("rechaza un nombre vacío, de solo espacios o de más de 60 caracteres", () => {
    expect(validarNombreCategoria("")).not.toBe("");
    expect(validarNombreCategoria("   ")).not.toBe("");
    expect(validarNombreCategoria("a".repeat(61))).not.toBe("");
  });
});