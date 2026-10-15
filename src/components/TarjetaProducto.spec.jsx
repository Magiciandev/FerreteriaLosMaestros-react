import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderConRouter } from "../test/renderConRouter";
import TarjetaProducto from "./TarjetaProducto";

const producto = {
  id: "MC001",
  nombre: "Cemento Polpaico gris 25 kg",
  categoria: "construccion",
  subcategoria: "Cementos",
  marca: "Polpaico",
  unidad: "Saco",
  precio: 5990,
  descuento: 0,
  stock: 80,
  stockMinimo: 20,
  imagen: null,
};

function dibujar(cambios = {}, onAgregar = vi.fn()) {
  renderConRouter(<TarjetaProducto producto={{ ...producto, ...cambios }} onAgregar={onAgregar} />);
  return onAgregar;
}

describe("TarjetaProducto", () => {
  it("[A3] muestra el nombre, la marca, la unidad y el precio formateado que recibe por props", () => {
    dibujar();

    expect(screen.getByRole("heading", { name: producto.nombre })).toBeInTheDocument();
    expect(screen.getByText("Polpaico - Saco")).toBeInTheDocument();
    expect(screen.getByText("$5.990")).toBeInTheDocument();
  });

  it("[A4] un producto en oferta muestra el descuento, el precio de lista tachado y el precio final", () => {
    dibujar({ descuento: 10 });

    expect(screen.getByText("-10%")).toBeInTheDocument();
    expect(screen.getByText("$5.990")).toHaveClass("precio-lista");
    expect(screen.getByText("$5.391")).toBeInTheDocument();
  });

  it("[A5] con stock 0 muestra Sin stock y deshabilita el botón de agregar", () => {
    dibujar({ stock: 0 });

    expect(screen.getByText("Sin stock")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Agregar/ })).toBeDisabled();
  });

  it("[A6] al pulsar Agregar al carrito llama a onAgregar con el producto", async () => {
    const usuario = userEvent.setup();
    const onAgregar = dibujar();

    await usuario.click(screen.getByRole("button", { name: `Agregar ${producto.nombre} al carrito` }));

    expect(onAgregar).toHaveBeenCalledTimes(1);
    expect(onAgregar).toHaveBeenCalledWith(expect.objectContaining({ id: "MC001" }));
  });
});
