import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { entradasBlog } from "../test/datosDePrueba";
import { renderConRouter } from "../test/renderConRouter";
import Blog from "./Blog";
import DetalleBlog from "./DetalleBlog";

describe("Blog", () => {
  it("lista todas las entradas con su fecha y un enlace a cada una", () => {
    renderConRouter(<Blog entradas={entradasBlog} />);

    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByText(/12 de septiembre de 2026/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Leer más: Herramientas básicas" })).toHaveAttribute("href", "/blog/B002");
  });
});

describe("DetalleBlog", () => {
  function dibujar(id) {
    renderConRouter(
      <Routes>
        <Route path="/blog/:id" element={<DetalleBlog entradas={entradasBlog} />} />
      </Routes>,
      { ruta: `/blog/${id}` }
    );
  }

  it("muestra el título, la fecha y todos los párrafos de la entrada", () => {
    dibujar("B001");

    expect(screen.getByRole("heading", { name: "Cómo elegir el cemento adecuado" })).toBeInTheDocument();
    expect(screen.getByText(/12 de septiembre de 2026/)).toBeInTheDocument();
    expect(screen.getByText("Primer párrafo.")).toBeInTheDocument();
    expect(screen.getByText("Segundo párrafo.")).toBeInTheDocument();
  });

  it("con un id que no existe muestra un mensaje y un enlace de vuelta", () => {
    dibujar("B999");

    expect(screen.getByRole("heading", { name: "La entrada no existe" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al blog" })).toHaveAttribute("href", "/blog");
  });
});
