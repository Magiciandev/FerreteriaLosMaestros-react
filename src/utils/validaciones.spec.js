import { validarRun } from "./validaciones";

describe("validaciones", () => {
  it("[B1] validarRun acepta un RUN con dígito verificador correcto y rechaza uno incorrecto", () => {
    expect(validarRun("123456785")).toBe("");
    expect(validarRun("123456780")).toMatch(/RUN inválido/);
  });
});
