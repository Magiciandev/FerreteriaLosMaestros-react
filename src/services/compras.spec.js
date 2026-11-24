import { armarSolicitudOrden, etiquetaEntrega, requiereDireccion } from "./compras";

const lineas = [
  { idProducto: "MC001", nombre: "Cemento", precioUnitario: 5990, cantidad: 2, subtotal: 11980, stock: 80, ajustada: false },
  { idProducto: "HE010", nombre: "Taladro", precioUnitario: 39992, cantidad: 1, subtotal: 39992, stock: 4, ajustada: false },
];

describe("services/compras", () => {
  it("B8 armarSolicitudOrden arma la compra con despacho: cliente limpio, dirección y solo producto y cantidad", () => {
    const solicitud = armarSolicitudOrden({
      datos: {
        nombre: " Ana ", apellidos: " Pérez ", correo: " ANA@Gmail.com ", entrega: "domicilio",
        calle: " Av. Siempre Viva 123 ", departamento: "", region: "Metropolitana", comuna: "Santiago", indicaciones: " Portón negro ",
      },
      lineas,
      aprobado: true,
    });
    expect(solicitud.cliente).toEqual({ nombre: "Ana", apellidos: "Pérez", correo: "ana@gmail.com" });
    expect(solicitud.entrega).toMatchObject({ tipo: "domicilio", calle: "Av. Siempre Viva 123", comuna: "Santiago", indicaciones: "Portón negro" });
    expect(solicitud.items).toEqual([{ idProducto: "MC001", cantidad: 2 }, { idProducto: "HE010", cantidad: 1 }]);
    expect(solicitud.pagoAprobado).toBe(true);
  });

  it("B9 armarSolicitudOrden con retiro en tienda no envía dirección y registra el pago rechazado", () => {
    const datos = { nombre: "Ana", apellidos: "Pérez", correo: "ana@gmail.com", entrega: "retiro", calle: "x", departamento: "y", region: "z", comuna: "w", indicaciones: "v" };
    const solicitud = armarSolicitudOrden({ datos, lineas, aprobado: false });
    expect(solicitud.entrega).toEqual({ tipo: "retiro", calle: "", departamento: "", region: "", comuna: "", indicaciones: "" });
    expect(solicitud.pagoAprobado).toBe(false);
  });

  it("B10 etiquetaEntrega y requiereDireccion: solo el retiro en tienda no pide dirección", () => {
    expect(etiquetaEntrega("obra")).toBe("Despacho a obra");
    expect(etiquetaEntrega("otro")).toBe("otro");
    expect(requiereDireccion("retiro")).toBe(false);
    expect(requiereDireccion("obra")).toBe(true);
  });
});
