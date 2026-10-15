import { screen } from "@testing-library/react";
import { productos } from "../test/datosDePrueba";
import { renderConRouter } from "../test/renderConRouter";
import Ofertas from "./Ofertas";

describe("Ofertas", () => {
  it("muestra solo los productos con descuento, de mayor a menor descuento", () => {
    renderConRouter(<Ofertas productos={productos} onAgregar={() => {}} />);

    const titulos = screen.getAllByRole("heading", { level: 3 }).map((titulo) => titulo.textContent);
    expect(titulos).toEqual(["Taladro percutor 650 W", "Martillo carpintero 16 oz"]);
  });

  it("sin productos en oferta muestra un mensaje", () => {
    renderConRouter(<Ofertas productos={[productos[0]]} onAgregar={() => {}} />);

    expect(screen.getByText("Por ahora no hay productos en oferta.")).toBeInTheDocument();
  });
});
