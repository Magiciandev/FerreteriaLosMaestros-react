import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderConRouter } from "../test/renderConRouter";
import AvisoCarrito from "./AvisoCarrito";

describe("AvisoCarrito", () => {
  it("visible muestra el mensaje y un enlace al carrito", () => {
    renderConRouter(<AvisoCarrito mensaje="Cemento se agregó al carrito." visible onCerrar={() => {}} />);

    expect(screen.getByText("Cemento se agregó al carrito.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver carrito" })).toHaveAttribute("href", "/carrito");
  });

  it("no visible no muestra el mensaje", () => {
    renderConRouter(<AvisoCarrito mensaje="Cemento se agregó al carrito." visible={false} onCerrar={() => {}} />);

    expect(screen.queryByText("Cemento se agregó al carrito.")).not.toBeInTheDocument();
  });

  it("al pulsar el botón de cerrar ejecuta onCerrar", async () => {
    const usuario = userEvent.setup();
    const onCerrar = vi.fn();
    renderConRouter(<AvisoCarrito mensaje="Aviso" visible onCerrar={onCerrar} />);

    await usuario.click(screen.getByRole("button", { name: "Cerrar aviso" }));

    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
