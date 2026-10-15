import { screen } from "@testing-library/react";
import { categorias } from "../test/datosDePrueba";
import { renderConRouter } from "../test/renderConRouter";
import Nosotros from "./Nosotros";

describe("Nosotros", () => {
  it("presenta la ferretería y lista las categorías recibidas", () => {
    renderConRouter(<Nosotros categorias={categorias} />);

    expect(screen.getByRole("heading", { level: 1, name: "Nosotros" })).toBeInTheDocument();
    expect(screen.getByText(/productos de 2 categorías/)).toHaveTextContent("Materiales de Construcción, Herramientas");
  });
});
