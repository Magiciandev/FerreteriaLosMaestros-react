import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { categorias, productos } from "../test/datosDePrueba";
import { renderConRouter } from "../test/renderConRouter";
import Categoria from "./Categoria";
import Categorias from "./Categorias";

describe("Categorias", () => {
  it("lista cada categoría con su cantidad de productos y su enlace", () => {
    renderConRouter(<Categorias categorias={categorias} productos={productos} />);

    expect(screen.getByRole("link", { name: "Herramientas" })).toHaveAttribute("href", "/categorias/herramientas");
    expect(screen.getAllByText("2 productos")).toHaveLength(2);
  });
});

describe("Categoria", () => {
  function dibujar(slug) {
    renderConRouter(
      <Routes>
        <Route path="/categorias/:slug" element={<Categoria categorias={categorias} productos={productos} onAgregar={() => {}} />} />
      </Routes>,
      { ruta: `/categorias/${slug}` }
    );
  }

  it("muestra el nombre de la categoría y solo sus productos", () => {
    dibujar("herramientas");

    expect(screen.getByRole("heading", { level: 1, name: "Herramientas" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("con un slug que no existe muestra un mensaje", () => {
    dibujar("inexistente");

    expect(screen.getByRole("heading", { name: "La categoría no existe" })).toBeInTheDocument();
  });
});
