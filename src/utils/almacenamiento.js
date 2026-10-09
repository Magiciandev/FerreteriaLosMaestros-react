// Lectura y escritura de JSON en localStorage.
// Si la clave no existe o el contenido está dañado, devuelve el valor por defecto
// en vez de romper la aplicación.
export function leerJSON(clave, porDefecto) {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado === null ? porDefecto : JSON.parse(guardado);
  } catch {
    return porDefecto;
  }
}

export function guardarJSON(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

export function borrarClave(clave) {
  localStorage.removeItem(clave);
}
