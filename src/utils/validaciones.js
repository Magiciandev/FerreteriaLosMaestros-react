/*
 * Validaciones de formularios (reglas de la Fase 1 / ERS).
 * Cada función recibe el valor tal como viene del <input> (texto) y devuelve:
 *   ""            -> el valor es válido
 *   "mensaje..."  -> el valor es inválido; el mensaje se muestra junto al campo
 * Así un formulario controlado puede guardar el resultado directamente en su estado de errores.
 */

export const DOMINIOS_PERMITIDOS = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

const texto = (valor) => String(valor ?? "").trim();

// ---------- RUN chileno (módulo 11) ----------
export function calcularDigitoVerificador(cuerpo) {
  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return "0";
  if (resto === 10) return "K";
  return String(resto);
}

// Sin puntos ni guion, 7 a 9 caracteres (cuerpo de 6 a 8 dígitos + dígito verificador).
export function validarRun(valor) {
  const limpio = texto(valor).toUpperCase();
  const mensaje = "RUN inválido. Ingresa sin puntos ni guion (ej: 12345678K) y verifica el dígito verificador.";
  if (!/^[0-9]{6,8}[0-9K]$/.test(limpio)) return mensaje;
  const cuerpo = limpio.slice(0, -1);
  return calcularDigitoVerificador(cuerpo) === limpio.slice(-1) ? "" : mensaje;
}

// ---------- Datos de persona ----------
export function validarNombre(valor) {
  const largo = texto(valor).length;
  return largo > 0 && largo <= 50 ? "" : "El nombre es obligatorio y debe tener máximo 50 caracteres.";
}

export function validarApellidos(valor) {
  const largo = texto(valor).length;
  return largo > 0 && largo <= 100 ? "" : "Los apellidos son obligatorios y deben tener máximo 100 caracteres.";
}

export function validarCorreo(valor) {
  const correo = texto(valor);
  const mensaje = "Correo inválido. Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com (máx. 100 caracteres).";
  if (correo.length === 0 || correo.length > 100) return mensaje;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return mensaje;
  const dominio = correo.split("@")[1].toLowerCase();
  return DOMINIOS_PERMITIDOS.includes(dominio) ? "" : mensaje;
}

// Campo opcional: vacío es válido; si viene, debe ser una fecha pasada.
export function validarFechaNacimiento(valor) {
  const fecha = texto(valor);
  if (fecha === "") return "";
  const parseada = new Date(fecha);
  return !Number.isNaN(parseada.getTime()) && parseada < new Date() ? "" : "Ingresa una fecha de nacimiento válida.";
}

export function validarTipoCliente(valor) {
  return valor === "particular" || valor === "contratista" ? "" : "Selecciona si eres Particular o Contratista.";
}

// ---------- Dirección ----------
export function validarRegion(valor) {
  return texto(valor) ? "" : "Selecciona una región.";
}

export function validarComuna(valor) {
  return texto(valor) ? "" : "Selecciona una comuna.";
}

export function validarDireccion(valor) {
  const largo = texto(valor).length;
  return largo > 0 && largo <= 300 ? "" : "La dirección es obligatoria y debe tener máximo 300 caracteres.";
}

// ---------- Contraseña (no se aplica trim) ----------
export function validarPassword(valor) {
  const largo = String(valor ?? "").length;
  return largo >= 4 && largo <= 10 ? "" : "La contraseña debe tener entre 4 y 10 caracteres.";
}

export function validarPasswordConfirmar(valor, passwordOriginal) {
  return valor === passwordOriginal ? "" : "Las contraseñas no coinciden.";
}

// ---------- Contacto ----------
export function validarNombreContacto(valor) {
  const largo = texto(valor).length;
  return largo > 0 && largo <= 100 ? "" : "El nombre es obligatorio (máximo 100 caracteres).";
}

export function validarMensajeContacto(valor) {
  const largo = texto(valor).length;
  return largo >= 20 && largo <= 500 ? "" : "Cuéntanos qué necesitas (entre 20 y 500 caracteres).";
}

// ---------- Producto (panel de administración) ----------
export function validarCodigoProducto(valor) {
  return texto(valor).length >= 3 ? "" : "El código debe tener al menos 3 caracteres.";
}

export function validarNombreProducto(valor) {
  const largo = texto(valor).length;
  return largo > 0 && largo <= 100 ? "" : "El nombre es obligatorio (máximo 100 caracteres).";
}

export function validarDescripcionProducto(valor) {
  return texto(valor).length <= 500 ? "" : "La descripción no puede superar los 500 caracteres.";
}

export function validarCategoria(valor) {
  return texto(valor) ? "" : "Selecciona una categoría.";
}

export function validarPrecio(valor) {
  const numero = Number(texto(valor));
  return texto(valor) !== "" && !Number.isNaN(numero) && numero >= 0 ? "" : "Ingresa un precio válido (mínimo 0).";
}

export function validarStock(valor) {
  return /^\d+$/.test(texto(valor)) ? "" : "Ingresa un stock entero válido (mínimo 0).";
}

// Opcional: vacío es válido; si viene, entero mayor o igual a 0.
export function validarStockMinimo(valor) {
  const dato = texto(valor);
  return dato === "" || /^\d+$/.test(dato) ? "" : "El stock crítico debe ser un entero mayor o igual a 0.";
}

// Descuento de oferta: entero entre 0 y 90 (vacío cuenta como 0).
export function validarDescuento(valor) {
  const dato = texto(valor);
  if (dato === "") return "";
  return /^\d+$/.test(dato) && Number(dato) <= 90 ? "" : "El descuento debe ser un entero entre 0 y 90.";
}
