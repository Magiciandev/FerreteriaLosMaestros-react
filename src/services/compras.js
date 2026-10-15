import { calcularTotal } from "../utils/carrito";

// Formas de recibir la compra. El costo de despacho no se calcula: el enunciado no lo pide.
export const OPCIONES_ENTREGA = [
  { id: "retiro", etiqueta: "Retiro en tienda" },
  { id: "domicilio", etiqueta: "Despacho a domicilio" },
  { id: "obra", etiqueta: "Despacho a obra" },
];

export function etiquetaEntrega(tipo) {
  return OPCIONES_ENTREGA.find((opcion) => opcion.id === tipo)?.etiqueta ?? tipo;
}

// Solo el retiro en tienda no necesita dirección.
export function requiereDireccion(tipo) {
  return tipo !== "retiro";
}

// Arma el registro de la orden (sin id: la base de datos lo genera) a partir de lo que se
// escribió en el checkout y de las líneas del carrito. "aprobado" decide el estado.
export function construirOrden({ datos, lineas, aprobado, idUsuario = null, fecha = new Date().toISOString() }) {
  const conDireccion = requiereDireccion(datos.entrega);
  return {
    fecha,
    estado: aprobado ? "pagada" : "rechazada",
    cliente: {
      nombre: datos.nombre.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo.trim().toLowerCase(),
    },
    entrega: {
      tipo: datos.entrega,
      calle: conDireccion ? datos.calle.trim() : "",
      departamento: conDireccion ? datos.departamento.trim() : "",
      region: conDireccion ? datos.region : "",
      comuna: conDireccion ? datos.comuna : "",
      indicaciones: conDireccion ? datos.indicaciones.trim() : "",
    },
    items: lineas.map(({ idProducto, nombre, precioUnitario, cantidad, subtotal }) => ({
      idProducto, nombre, precioUnitario, cantidad, subtotal,
    })),
    total: calcularTotal(lineas),
    idUsuario,
  };
}
