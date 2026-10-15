import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { categorias, productos } from "../test/datosDePrueba";
import { renderConRouter } from "../test/renderConRouter";
import DetalleProducto from "./DetalleProducto";

function dibujar(id, onAgregar = vi.fn()) {
  renderConRouter(
    <Routes>
      <Route path="/productos/:id" element={<DetalleProducto productos={productos} categorias={categorias} onAgregar={onAgregar} />} />
    </Routes>,
    { ruta: `/productos/${id}` }
  );
  return onAgregar;
}

describe("DetalleProducto", () => {
  it("muestra la ficha del producto con su categoría enlazada", () => {
    dibujar("MC001");

    expect(screen.getByRole("heading", { level: 1, name: "Cemento Polpaico gris 25 kg" })).toBeInTheDocument();
    expect(screen.getByText("Cementos")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Materiales de Construcción" })).toHaveAttribute("href", "/categorias/construccion");
    expect(screen.getByText("80 unidades")).toBeInTheDocument();
  });

  it("con un id que no existe muestra un mensaje y un enlace al catálogo", () => {
    dibujar("NOEXISTE");

    expect(screen.getByRole("heading", { name: "El producto no existe" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver a productos" })).toHaveAttribute("href", "/productos");
  });

  it("agrega una unidad por defecto", async () => {
    const usuario = userEvent.setup();
    const onAgregar = dibujar("MC001");

    await usuario.click(screen.getByRole("button", { name: "Agregar al carrito" }));

    expect(onAgregar).toHaveBeenCalledWith(expect.objectContaining({ id: "MC001" }), 1);
  });

  it("agrega la cantidad escrita en el selector", async () => {
    const usuario = userEvent.setup();
    const onAgregar = dibujar("MC001");
    const cantidad = screen.getByLabelText("Cantidad");

    await usuario.clear(cantidad);
    await usuario.type(cantidad, "3");
    await usuario.click(screen.getByRole("button", { name: "Agregar al carrito" }));

    expect(onAgregar).toHaveBeenCalledWith(expect.objectContaining({ id: "MC001" }), 3);
  });

  it("si la cantidad supera el stock muestra el error y deshabilita el botón", () => {
    dibujar("HE010");

    fireEvent.change(screen.getByLabelText("Cantidad"), { target: { value: "9" } });

    expect(screen.getByText("Ingresa una cantidad entre 1 y 4.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agregar al carrito" })).toBeDisabled();
  });

  it("un producto sin stock muestra un aviso y no ofrece agregarlo", () => {
    dibujar("HE011");

    expect(screen.getByText("Este producto no tiene stock por ahora.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Agregar al carrito" })).not.toBeInTheDocument();
  });

  it("un producto en oferta muestra el descuento y el precio final", () => {
    dibujar("HE010");

    expect(screen.getByText("-20%")).toBeInTheDocument();
    expect(screen.getByText("$39.992")).toBeInTheDocument();
  });
});
