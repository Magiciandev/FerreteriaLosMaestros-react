import { categorias } from "../test/datosDePrueba";
import { formatearFechaHora } from "./formato";
import { nombreCategoria } from "./categorias";
import { validarNombreCategoria, validarSlugCategoria } from "./validacionesCategoria";

describe("categorías y formato", () => {
  it("C8 nombreCategoria busca el nombre por identificador y, si no existe, muestra el identificador", () => {
    expect(nombreCategoria(categorias, "herramientas")).toBe("Herramientas");
    expect(nombreCategoria(categorias, "desconocida")).toBe("desconocida");
  });

  it("C9 validarSlugCategoria y validarNombreCategoria aceptan lo correcto y rechazan lo incorrecto", () => {
    expect(validarSlugCategoria("pinturas-y-barnices")).toBe("");
    expect(validarSlugCategoria("Pinturas Y")).not.toBe("");
    expect(validarSlugCategoria(null)).not.toBe("");
    expect(validarNombreCategoria("Pinturas")).toBe("");
    expect(validarNombreCategoria("")).not.toBe("");
  });

  it("C10 formatearFechaHora entrega fecha y hora legibles", () => {
    expect(formatearFechaHora("2026-10-16T14:30:00.000Z")).toMatch(/2026/);
  });
});
