// Función base para hablar con el backend: arma la URL, agrega el token de la sesión (si hay) y
// convierte las respuestas con error en un ErrorApi con un mensaje legible.
// Los servicios (productoService, authService...) la usan para no repetir este código.

export class ErrorApi extends Error {
  constructor(mensaje, estado) {
    super(mensaje);
    this.estado = estado;
  }
}

// Mensajes para cuando el servidor responde con error pero sin explicar el motivo (por ejemplo 401).
const MENSAJES = {
  401: "Tu sesión venció o no tienes permiso. Vuelve a iniciar sesión.",
  403: "No tienes permiso para realizar esta acción.",
  404: "No encontramos lo que buscabas.",
};

export async function solicitar(base, ruta, opciones = {}) {
  const token = sessionStorage.getItem("token");
  const cabeceras = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  let respuesta;
  try {
    respuesta = await fetch(`${base}${ruta}`, { ...opciones, headers: cabeceras });
  } catch {
    throw new ErrorApi("No se pudo conectar con el servidor. Revisa que esté encendido.", 0);
  }

  // 204: eliminación correcta, no hay cuerpo.
  if (respuesta.status === 204) return null;

  const cuerpo = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    // El backend explica el error en "error" (recursos) o en "mensaje" (login del docente).
    const mensaje = cuerpo?.error ?? cuerpo?.mensaje ?? MENSAJES[respuesta.status] ?? `La solicitud falló (${respuesta.status}).`;
    throw new ErrorApi(mensaje, respuesta.status);
  }
  return cuerpo;
}
