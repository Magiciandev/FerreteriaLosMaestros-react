import { screen } from "@testing-library/react";
import { renderConRouter } from "../test/renderConRouter";
import GrillaProductos from "./GrillaProductos";

const productos = [1, 2, 3].map((n) => ({
  id: `P00${n}`, nombre: `Producto ${n}`, marca: "Marca", unidad: "Unidad",
  precio: 1000 * n, descuento: 0, stock: 10, stockMinimo: 2, imagen: null,
}));

describe("GrillaProductos", () => {
  it("dibuja una tarjeta por cada producto recibido", () => {
    renderConRouter(<GrillaProductos productos={productos} onAgregar={() => {}} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("heading", { name: "Producto 2" })).toBeInTheDocument();
  });

  it("sin productos muestra el mensaje por defecto y ninguna tarjeta", () => {
    renderConRouter(<GrillaProductos productos={[]} onAgregar={() => {}} />);

    expect(screen.getByText("No hay productos para mostrar.")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("permite personalizar el mensaje cuando no hay productos", () => {
    renderConRouter(<GrillaProductos productos={[]} onAgregar={() => {}} mensajeVacio="Sin resultados." />);

    expect(screen.getByText("Sin resultados.")).toBeInTheDocument();
  });
});
