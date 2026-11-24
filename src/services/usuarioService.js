import { solicitar } from "./http";

// Los usuarios viven en el servicio de autenticación; todas estas rutas son solo para el administrador.
const AUTH = import.meta.env.VITE_AUTH_API_URL;

export const listarUsuarios = () => solicitar(AUTH, "/usuarios");

export const crearUsuario = (usuario) =>
  solicitar(AUTH, "/usuarios", { method: "POST", body: JSON.stringify(usuario) });

export const actualizarUsuario = (id, usuario) =>
  solicitar(AUTH, `/usuarios/${id}`, { method: "PUT", body: JSON.stringify(usuario) });

export const eliminarUsuario = (id) => solicitar(AUTH, `/usuarios/${id}`, { method: "DELETE" });
