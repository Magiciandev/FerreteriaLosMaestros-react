import { solicitar } from "./http";

const API = import.meta.env.VITE_API_URL;

// Registra una compra. El servidor calcula precios y total y, si el pago se aprueba, descuenta el stock.
export const crearOrden = (solicitud) =>
  solicitar(API, "/ordenes", { method: "POST", body: JSON.stringify(solicitud) });

// Solo el administrador puede ver las órdenes.
export const listarOrdenes = () => solicitar(API, "/ordenes");
