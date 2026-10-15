import { render, screen } from "@testing-library/react";
import PaginaPendiente from "./PaginaPendiente";

describe("PaginaPendiente", () => {
  it("muestra el título recibido y el texto Contenido no disponible por defecto", () => {
    render(<PaginaPendiente titulo="Carrito de compras" />);

    expect(screen.getByRole("heading", { name: "Carrito de compras" })).toBeInTheDocument();
    expect(screen.getByText("Contenido no disponible.")).toBeInTheDocument();
  });

  it("permite reemplazar la descripción", () => {
    render(<PaginaPendiente titulo="Perfil" descripcion="Disponible pronto." />);

    expect(screen.getByText("Disponible pronto.")).toBeInTheDocument();
    expect(screen.queryByText("Contenido no disponible.")).not.toBeInTheDocument();
  });
});
