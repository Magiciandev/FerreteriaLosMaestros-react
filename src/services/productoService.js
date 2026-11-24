import { solicitar } from "./http";

const API = import.meta.env.VITE_API_URL;

export const listarProductos = () => solicitar(API, "/productos");

export const crearProducto = (producto) =>
  solicitar(API, "/productos", { method: "POST", body: JSON.stringify(producto) });

export const actualizarProducto = (id, producto) =>
  solicitar(API, `/productos/${id}`, { method: "PUT", body: JSON.stringify(producto) });

export const eliminarProducto = (id) => solicitar(API, `/productos/${id}`, { method: "DELETE" });
