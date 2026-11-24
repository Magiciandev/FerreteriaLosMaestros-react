import { solicitar } from "./http";

const API = import.meta.env.VITE_API_URL;

export const crearConsulta = (consulta) =>
  solicitar(API, "/consultas", { method: "POST", body: JSON.stringify(consulta) });
