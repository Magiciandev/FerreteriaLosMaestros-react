import * as v from "./validaciones";

// Cada fila: [validador, un valor correcto, un valor incorrecto].
const reglas = [
  [v.validarRun, "12345678-5", "12345678-9"],
  [v.validarNombre, "Ana", ""],
  [v.validarApellidos, "Pérez Soto", ""],
  [v.validarCorreo, "ana@gmail.com", "ana@otro.cl"],
  [v.validarFechaNacimiento, "1990-05-10", "2999-01-01"],
  [v.validarTipoCliente, "particular", "otro"],
  [v.validarRol, "VENDEDOR", "JEFE"],
  [v.validarRegion, "Metropolitana", ""],
  [v.validarComuna, "Santiago", "   "],
  [v.validarDireccion, "Av. Siempre Viva 123", ""],
  [v.validarPassword, "clave1", "abc"],
  [v.validarNombreContacto, "Ana", ""],
  [v.validarMensajeContacto, "m".repeat(20), "corto"],
  [v.validarCodigoProducto, "ABC1", "AB"],
  [v.validarNombreProducto, "Taladro", ""],
  [v.validarDescripcionProducto, "", "d".repeat(501)],
  [v.validarCategoria, "herramientas", ""],
  [v.validarPrecio, "5990", "-1"],
  [v.validarStock, "10", "1.5"],
  [v.validarStockMinimo, "", "x"],
  [v.validarDescuento, "20", "95"],
  [v.validarOpcionEntrega, "retiro", ""],
  [v.validarDepartamento, "12B", "d".repeat(31)],
  [v.validarIndicaciones, "Portón negro", "i".repeat(301)],
  [v.validarTextoCorto("La marca"), "Bosch", ""],
];

describe("utils/validaciones", () => {
  it("C6 cada validador acepta un valor correcto (devuelve vacío) y rechaza uno incorrecto (devuelve el mensaje)", () => {
    for (const [validar, correcto, incorrecto] of reglas) {
      expect(validar(correcto)).toBe("");
      expect(validar(incorrecto)).not.toBe("");
    }
  });

  it("C7 casos límite: valores vacíos, dígito verificador K y 0, correos mal escritos y contraseñas", () => {
    expect(v.validarNombre(null)).not.toBe("");
    expect(v.validarCategoria(undefined)).not.toBe("");
    expect(v.validarPassword(undefined)).not.toBe("");
    expect(v.validarCodigoProducto("A".repeat(31))).not.toBe("");
    expect(v.validarPrecio("1.5")).not.toBe("");
    expect(v.validarPrecio("2147483648")).not.toBe("");
    expect(v.validarStock("2147483648")).not.toBe("");
    expect(v.validarStockMinimo("2147483648")).not.toBe("");
    expect(v.etiquetaRol("ADMIN")).toBe("Administrador");
    expect(v.etiquetaRol("OTRO")).toBe("OTRO");
    expect(v.validarRun("10.000.013-k")).toBe("");
    expect(v.validarRun("10000004-0")).toBe("");
    expect(v.validarRun("abc")).not.toBe("");
    expect(v.validarCorreo("sin-arroba")).not.toBe("");
    expect(v.validarCorreo(`${"a".repeat(100)}@gmail.com`)).not.toBe("");
    expect(v.validarFechaNacimiento("no-es-fecha")).not.toBe("");
    expect(v.validarDescuento("")).toBe("");
    expect(v.validarPasswordConfirmar("clave1", "clave1")).toBe("");
    expect(v.validarPasswordConfirmar("clave1", "otra")).not.toBe("");
    expect(v.validarTextoCorto("La unidad", 5)("demasiado")).toBe("La unidad es obligatoria (máximo 5 caracteres).");
  });
});
