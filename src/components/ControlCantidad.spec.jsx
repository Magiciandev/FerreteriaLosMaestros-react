import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ControlCantidad from "./ControlCantidad";

describe("ControlCantidad", () => {
  it("A6 los botones + y - avisan la nueva cantidad", async () => {
    const usuario = userEvent.setup();
    const onCambiar = vi.fn();
    render(<ControlCantidad nombre="Cemento" cantidad={2} maximo={5} onCambiar={onCambiar} />);
    await usuario.click(screen.getByRole("button", { name: /aumentar/i }));
    await usuario.click(screen.getByRole("button", { name: /disminuir/i }));
    expect(onCambiar).toHaveBeenNthCalledWith(1, 3);
    expect(onCambiar).toHaveBeenNthCalledWith(2, 1);
  });

  it("A7 deshabilita - en la cantidad mínima y + en el máximo", () => {
    const { rerender } = render(<ControlCantidad nombre="Cemento" cantidad={1} maximo={5} onCambiar={vi.fn()} />);
    expect(screen.getByRole("button", { name: /disminuir/i })).toBeDisabled();
    rerender(<ControlCantidad nombre="Cemento" cantidad={5} maximo={5} onCambiar={vi.fn()} />);
    expect(screen.getByRole("button", { name: /aumentar/i })).toBeDisabled();
  });
});
