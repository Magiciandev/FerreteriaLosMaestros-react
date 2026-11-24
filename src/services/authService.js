import { solicitar } from "./http";

const AUTH = import.meta.env.VITE_AUTH_API_URL;

// Inicia sesión en el servicio de autenticación. Guarda el token y el usuario en sessionStorage
// (se borran al cerrar la pestaña) y devuelve el usuario: { correo, rol }.
export async function login(correo, password) {
  const respuesta = await solicitar(AUTH, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ correo, password }),
  });
  const usuario = { correo: respuesta.correo, rol: respuesta.rol };
  sessionStorage.setItem("token", respuesta.token);
  sessionStorage.setItem("usuario", JSON.stringify(usuario));
  return usuario;
}

export function cerrarSesion() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("usuario");
}

// Devuelve el usuario de la sesión ({ correo, rol }) o null si no hay sesión o el token venció.
// El token es un JWT: su parte central (payload) trae "exp", la fecha de vencimiento en segundos.
export function obtenerSesion() {
  const token = sessionStorage.getItem("token");
  const usuario = sessionStorage.getItem("usuario");
  if (!token || !usuario) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replaceAll("-", "+").replaceAll("_", "/")));
    if (payload.exp * 1000 > Date.now()) return JSON.parse(usuario);
  } catch {
    // Un token mal formado se trata igual que uno vencido.
  }
  cerrarSesion();
  return null;
}

// Crea una cuenta de cliente (rol CLIENTE) en el servicio de autenticación.
export const registrarCliente = (datos) =>
  solicitar(AUTH, "/auth/registro", { method: "POST", body: JSON.stringify(datos) });
