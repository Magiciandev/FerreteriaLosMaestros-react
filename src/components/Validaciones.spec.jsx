import {
  calcularDigitoVerificador,
  validarCorreo,
  validarDescuento,
  validarFechaNacimiento,
  validarMensajeContacto,
  validarNombre,
  validarPassword,
  validarPasswordConfirmar,
  validarPrecio,
  validarRun,
  validarStock,
  validarStockMinimo,
} from "./validaciones";

// Las validaciones son funciones puras: reciben el texto del campo y devuelven "" si es
// válido o el mensaje de error si no. Por eso se prueban sin renderizar nada ni usar mocks:
// se les da una entrada y se comprueba la salida.
describe("validaciones", () => {
  describe("RUN (módulo 11)", () => {
    it("calcula el dígito verificador de un cuerpo conocido", () => {
      expect(calcularDigitoVerificador("12345678")).toBe("5");
      expect(calcularDigitoVerificador("11111111")).toBe("1");
    });

    it("el dígito verificador puede ser K (resto 10) o 0 (resto 11)", () => {
      expect(calcularDigitoVerificador("1000005")).toBe("K");
      expect(calcularDigitoVerificador("1000013")).toBe("0");
    });

    it("acepta un RUN con su dígito verificador correcto", () => {
      expect(validarRun("123456785")).toBe("");
    });

    it("acepta la K en minúscula, porque el valor se pasa a mayúscula antes de validar", () => {
      expect(validarRun("1000005k")).toBe("");
    });

    it("rechaza un RUN con el dígito verificador equivocado", () => {
      expect(validarRun("123456789")).toContain("RUN inválido");
    });

    it("rechaza un RUN con puntos o guion, o demasiado corto", () => {
      expect(validarRun("12.345.678-5")).toContain("RUN inválido");
      expect(validarRun("12345")).toContain("RUN inválido");
    });
  });

  describe("correo", () => {
    it("acepta los tres dominios permitidos, sin importar mayúsculas", () => {
      expect(validarCorreo("ana@duoc.cl")).toBe("");
      expect(validarCorreo("ana@profesor.duoc.cl")).toBe("");
      expect(validarCorreo("ANA@GMAIL.COM")).toBe("");
    });

    it("rechaza un dominio que no está en la lista", () => {
      expect(validarCorreo("ana@hotmail.com")).toContain("Correo inválido");
    });

    it("rechaza un texto sin arroba o vacío", () => {
      expect(validarCorreo("sin-arroba")).toContain("Correo inválido");
      expect(validarCorreo("")).toContain("Correo inválido");
    });

    it("rechaza un correo de más de 100 caracteres", () => {
      const largo = "a".repeat(95) + "@gmail.com";
      expect(validarCorreo(largo)).toContain("Correo inválido");
    });
  });

  describe("contraseña", () => {
    it("acepta entre 4 y 10 caracteres y rechaza fuera de ese rango", () => {
      expect(validarPassword("abc")).not.toBe("");
      expect(validarPassword("abcd")).toBe("");
      expect(validarPassword("abcdefghij")).toBe("");
      expect(validarPassword("abcdefghijk")).not.toBe("");
    });

    it("no recorta espacios: cuatro espacios cuentan como una contraseña válida", () => {
      expect(validarPassword("    ")).toBe("");
    });

    it("la confirmación debe ser idéntica a la contraseña", () => {
      expect(validarPasswordConfirmar("1234", "1234")).toBe("");
      expect(validarPasswordConfirmar("1234", "12345")).toBe("Las contraseñas no coinciden.");
    });
  });

  describe("textos con largo máximo", () => {
    it("el nombre es obligatorio y admite hasta 50 caracteres", () => {
      expect(validarNombre("")).not.toBe("");
      expect(validarNombre("   ")).not.toBe("");
      expect(validarNombre("a".repeat(50))).toBe("");
      expect(validarNombre("a".repeat(51))).not.toBe("");
    });

    it("el mensaje de contacto debe tener entre 20 y 500 caracteres", () => {
      expect(validarMensajeContacto("a".repeat(19))).not.toBe("");
      expect(validarMensajeContacto("a".repeat(20))).toBe("");
      expect(validarMensajeContacto("a".repeat(500))).toBe("");
      expect(validarMensajeContacto("a".repeat(501))).not.toBe("");
    });
  });

  describe("fecha de nacimiento (opcional)", () => {
    it("vacía es válida, una fecha pasada también", () => {
      expect(validarFechaNacimiento("")).toBe("");
      expect(validarFechaNacimiento("1990-05-10")).toBe("");
    });

    it("rechaza una fecha futura o un texto que no es fecha", () => {
      expect(validarFechaNacimiento("2999-01-01")).not.toBe("");
      expect(validarFechaNacimiento("no-es-fecha")).not.toBe("");
    });
  });

  describe("campos numéricos del producto", () => {
    it("el precio acepta 0 y decimales, pero no negativos, vacío ni letras", () => {
      expect(validarPrecio("0")).toBe("");
      expect(validarPrecio("1990.5")).toBe("");
      expect(validarPrecio("-1")).not.toBe("");
      expect(validarPrecio("")).not.toBe("");
      expect(validarPrecio("abc")).not.toBe("");
    });

    it("el stock debe ser un entero: rechaza decimales, negativos y vacío", () => {
      expect(validarStock("10")).toBe("");
      expect(validarStock("1.5")).not.toBe("");
      expect(validarStock("-3")).not.toBe("");
      expect(validarStock("")).not.toBe("");
    });

    it("el stock crítico es opcional: vacío es válido, un decimal no", () => {
      expect(validarStockMinimo("")).toBe("");
      expect(validarStockMinimo("5")).toBe("");
      expect(validarStockMinimo("2.5")).not.toBe("");
    });

    it("el descuento es un entero de 0 a 90 y vacío cuenta como sin descuento", () => {
      expect(validarDescuento("")).toBe("");
      expect(validarDescuento("90")).toBe("");
      expect(validarDescuento("91")).not.toBe("");
      expect(validarDescuento("10.5")).not.toBe("");
    });
  });
});