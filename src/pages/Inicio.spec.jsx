import { screen } from "@testing-library/react";
import { categorias, productos } from "../test/datosDePrueba";
import { renderConRouter } from "../test/renderConRouter";
import Inicio from "./Inicio";

describe("Inicio", () => {
  it("muestra la portada con accesos a productos y ofertas", () => {
    renderConRouter(<Inicio productos={productos} categorias={categorias} onAgregar={() => {}} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Todo para tu obra y tu hogar");
    expect(screen.getByRole("link", { name: "Ver productos" })).toHaveAttribute("href", "/productos");
    expect(screen.getByRole("link", { name: "Ver ofertas" })).toHaveAttribute("href", "/ofertas");
  });

  it("muestra una tarjeta por categoría con su cantidad de productos", () => {
    renderConRouter(<Inicio productos={productos} categorias={categorias} onAgregar={() => {}} />);

    expect(screen.getByRole("link", { name: "Herramientas" })).toHaveAttribute("href", "/categorias/herramientas");
  });

  it("destaca solo las ofertas que tienen stock", () => {
    renderConRouter(<Inicio productos={productos} categorias={categorias} onAgregar={() => {}} />);

    expect(screen.getByRole("heading", { name: "Taladro percutor 650 W" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Martillo carpintero 16 oz" })).not.toBeInTheDocument();
  });

  it("sin ofertas con stock no muestra la sección de ofertas", () => {
    renderConRouter(<Inicio productos={[productos[0]]} categorias={categorias} onAgregar={() => {}} />);

    expect(screen.queryByRole("heading", { name: "Ofertas destacadas" })).not.toBeInTheDocument();
  });
});
