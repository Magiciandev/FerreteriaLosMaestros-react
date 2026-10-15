import {
  calcularDigitoVerificador,
  validarCorreo,
  validarDescuento,
  validarMensajeContacto,
  validarPassword,
  validarPasswordConfirmar,
  validarPrecio,
  validarRun,
  validarStock,
  validarStockMinimo,
} from "./validaciones";

describe("validarRun", () => {
  it.each(["123456785", "111111111", "765432146"])("acepta el RUN válido %s", (run) => {
    expect(validarRun(run)).toBe("");
  });

  it.each(["123456780", "12.345.678-5", "1234", "", "abcdefghi"])("rechaza el RUN inválido '%s'", (run) => {
    expect(validarRun(run)).not.toBe("");
  });

  it("calcula el dígito verificador con módulo 11", () => {
    expect(calcularDigitoVerificador("12345678")).toBe("5");
    expect(calcularDigitoVerificador("11111111")).toBe("1");
  });
});

describe("validarCorreo", () => {
  it.each(["a@gmail.com", "a@DUOC.cl", "a@profesor.duoc.cl"])("acepta %s", (correo) => {
    expect(validarCorreo(correo)).toBe("");
  });

  it.each(["a@hotmail.com", "sin-arroba", "", `${"a".repeat(100)}@gmail.com`])("rechaza '%s'", (correo) => {
    expect(validarCorreo(correo)).not.toBe("");
  });
});

describe("contraseña", () => {
  it("exige entre 4 y 10 caracteres", () => {
    expect(validarPassword("abc")).not.toBe("");
    expect(validarPassword("abcd")).toBe("");
    expect(validarPassword("1234567890")).toBe("");
    expect(validarPassword("12345678901")).not.toBe("");
  });

  it("la confirmación debe coincidir con la contraseña", () => {
    expect(validarPasswordConfirmar("clave1", "clave1")).toBe("");
    expect(validarPasswordConfirmar("clave1", "clave2")).toBe("Las contraseñas no coinciden.");
  });
});

describe("campos de producto", () => {
  it("el precio acepta 0 y decimales, y rechaza negativos, vacío y texto", () => {
    expect(validarPrecio("0")).toBe("");
    expect(validarPrecio("12.5")).toBe("");
    expect(validarPrecio("-1")).not.toBe("");
    expect(validarPrecio("")).not.toBe("");
    expect(validarPrecio("abc")).not.toBe("");
  });

  it("el stock debe ser un entero mayor o igual a 0", () => {
    expect(validarStock("0")).toBe("");
    expect(validarStock("1.5")).not.toBe("");
    expect(validarStock("")).not.toBe("");
  });

  it("el stock crítico es opcional, pero si viene debe ser un entero válido", () => {
    expect(validarStockMinimo("")).toBe("");
    expect(validarStockMinimo("3")).toBe("");
    expect(validarStockMinimo("-2")).not.toBe("");
  });

  it("el descuento va de 0 a 90 y puede quedar vacío", () => {
    expect(validarDescuento("")).toBe("");
    expect(validarDescuento("25")).toBe("");
    expect(validarDescuento("95")).not.toBe("");
  });
});

describe("validarMensajeContacto", () => {
  it("exige entre 20 y 500 caracteres", () => {
    expect(validarMensajeContacto("corto")).not.toBe("");
    expect(validarMensajeContacto("x".repeat(20))).toBe("");
    expect(validarMensajeContacto("x".repeat(501))).not.toBe("");
  });
});
