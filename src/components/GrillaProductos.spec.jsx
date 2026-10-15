import { screen } from "@testing-library/react";
import { renderConRouter } from "../test/renderConRouter";
import GrillaProductos from "./GrillaProductos";

const productos = [1, 2, 3].map((n) => ({
  id: `P00${n}`, nombre: `Producto ${n}`, marca: "Marca", unidad: "Unidad",
  precio: 1000 * n, descuento: 0, stock: 10, stockMinimo: 2, imagen: null,
}));

describe("GrillaProductos", () => {
  it("[A7] dibuja una tarjeta por cada producto del arreglo recibido", () => {
    renderConRouter(<GrillaProductos productos={productos} onAgregar={() => {}} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("heading", { name: "Producto 2" })).toBeInTheDocument();
  });
});
