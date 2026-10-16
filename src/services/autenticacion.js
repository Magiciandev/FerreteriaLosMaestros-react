// Lógica de cuentas de usuario, sin pantalla ni base de datos: reciben el arreglo de usuarios
// como parámetro, así se pueden probar con datos de prueba y no dependen de dónde se guarden.
//
// Aviso sobre la contraseña: se compara en texto plano porque este proyecto no tiene servidor
// (limitación declarada en RNF-06 del ERS). Con un backend real se guardaría un hash.

const normalizarCorreo = (correo) => String(correo ?? "").trim().toLowerCase();
const normalizarRun = (run) => String(run ?? "").trim().toUpperCase();

// Busca al usuario cuyo correo y contraseña coinciden. El correo no distingue mayúsculas ni
// espacios sobrantes; la contraseña sí. Devuelve el usuario o null.
export function autenticar(usuarios, correo, password) {
  const buscado = normalizarCorreo(correo);
  return usuarios.find((usuario) => normalizarCorreo(usuario.correo) === buscado && usuario.password === password) ?? null;
}

// Datos que se guardan como "sesión": todo lo del usuario menos la contraseña y el resto de
// los datos personales, que no hace falta llevar en la sesión.
export function crearSesion(usuario) {
  const { id, nombre, apellidos, correo, tipo, rol } = usuario;
  return { id, nombre, apellidos, correo, tipo, rol };
}

// Revisa si el correo o el RUN ya pertenecen a otra cuenta. Devuelve { campo, error } con el
// primer duplicado encontrado, o null si están disponibles. "idActual" permite ignorar la
// propia cuenta cuando se edita un usuario.
export function encontrarDuplicado(usuarios, { correo, run, idActual } = {}) {
  const otros = usuarios.filter((usuario) => usuario.id !== idActual);
  if (correo && otros.some((usuario) => normalizarCorreo(usuario.correo) === normalizarCorreo(correo))) {
    return { campo: "correo", error: "Ya existe una cuenta con ese correo." };
  }
  if (run && otros.some((usuario) => usuario.run && normalizarRun(usuario.run) === normalizarRun(run))) {
    return { campo: "run", error: "Ya existe una cuenta con ese RUN." };
  }
  return null;
}
