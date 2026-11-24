import { solicitar } from "./http";

const API = import.meta.env.VITE_API_URL;

export const listarCategorias = () => solicitar(API, "/categorias");

export const crearCategoria = (categoria) =>
  solicitar(API, "/categorias", { method: "POST", body: JSON.stringify(categoria) });

export const actualizarCategoria = (slug, categoria) =>
  solicitar(API, `/categorias/${slug}`, { method: "PUT", body: JSON.stringify(categoria) });

export const eliminarCategoria = (slug) => solicitar(API, `/categorias/${slug}`, { method: "DELETE" });
