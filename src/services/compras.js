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

// Arma lo que se envía al servidor para registrar la compra (POST /api/ordenes) a partir de lo que
// se escribió en el checkout y de las líneas del carrito. Del carrito solo viajan el producto y la
// cantidad: el servidor calcula precios y total. "aprobado" simula el resultado del pago.
export function armarSolicitudOrden({ datos, lineas, aprobado }) {
  const conDireccion = requiereDireccion(datos.entrega);
  return {
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
    items: lineas.map(({ idProducto, cantidad }) => ({ idProducto, cantidad })),
    pagoAprobado: aprobado,
  };
}
