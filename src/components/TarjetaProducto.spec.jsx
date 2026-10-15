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
  describe("renderizado con props", () => {
    it("muestra el nombre, la marca, la unidad y el precio formateado", () => {
      dibujar();

      expect(screen.getByRole("heading", { name: producto.nombre })).toBeInTheDocument();
      expect(screen.getByText("Polpaico - Saco")).toBeInTheDocument();
      expect(screen.getByText("$5.990")).toBeInTheDocument();
    });

    it("el nombre enlaza al detalle del producto", () => {
      dibujar();

      expect(screen.getByRole("link", { name: producto.nombre })).toHaveAttribute("href", "/productos/MC001");
    });

    it("muestra la foto cuando existe y un marcador de texto cuando no", () => {
      dibujar({ imagen: "assets/img/productos/cemento.jpg" });
      expect(screen.getByRole("img", { name: producto.nombre })).toHaveAttribute("src", "/assets/img/productos/cemento.jpg");
    });

    it("sin foto muestra el marcador Sin imagen", () => {
      dibujar();

      expect(screen.getByRole("img", { name: "Sin imagen disponible" })).toBeInTheDocument();
    });
  });

  describe("renderizado condicional", () => {
    it("un producto en oferta muestra el descuento, el precio de lista tachado y el precio final", () => {
      dibujar({ descuento: 10 });

      expect(screen.getByText("-10%")).toBeInTheDocument();
      expect(screen.getByText("$5.990")).toHaveClass("precio-lista");
      expect(screen.getByText("$5.391")).toBeInTheDocument();
    });

    it("un producto sin oferta no muestra etiqueta de descuento", () => {
      dibujar();

      expect(screen.queryByText(/^-\d+%$/)).not.toBeInTheDocument();
    });

    it("con stock 0 muestra Sin stock y deshabilita el botón", () => {
      dibujar({ stock: 0 });

      expect(screen.getByText("Sin stock")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Agregar/ })).toBeDisabled();
    });

    it("con stock en el mínimo muestra Últimas unidades", () => {
      dibujar({ stock: 15 });

      expect(screen.getByText("Últimas unidades")).toBeInTheDocument();
    });
  });

  describe("eventos", () => {
    it("al pulsar Agregar al carrito llama a onAgregar con el producto", async () => {
      const usuario = userEvent.setup();
      const onAgregar = dibujar();

      await usuario.click(screen.getByRole("button", { name: `Agregar ${producto.nombre} al carrito` }));

      expect(onAgregar).toHaveBeenCalledTimes(1);
      expect(onAgregar).toHaveBeenCalledWith(expect.objectContaining({ id: "MC001" }));
    });

    it("sin stock el botón no ejecuta onAgregar", async () => {
      const usuario = userEvent.setup();
      const onAgregar = dibujar({ stock: 0 });

      await usuario.click(screen.getByRole("button", { name: /Agregar/ }));

      expect(onAgregar).not.toHaveBeenCalled();
    });
  });
});
