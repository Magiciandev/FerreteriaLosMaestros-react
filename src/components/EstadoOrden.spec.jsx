import { render, screen } from "@testing-library/react";
import EstadoOrden from "./EstadoOrden";

describe("EstadoOrden", () => {
  it("A8 muestra Pagada o Rechazada según el estado recibido", () => {
    const { rerender } = render(<EstadoOrden estado="pagada" />);
    expect(screen.getByText("Pagada")).toBeInTheDocument();
    rerender(<EstadoOrden estado="rechazada" />);
    expect(screen.getByText("Rechazada")).toBeInTheDocument();
  });
});
