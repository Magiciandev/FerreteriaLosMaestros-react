import { screen } from "@testing-library/react";
import { renderConRouter } from "../test/renderConRouter";
import Footer from "./Footer";

describe("Footer", () => {
  it("muestra el nombre de la ferretería", () => {
    renderConRouter(<Footer />);

    expect(screen.getByRole("heading", { name: "Ferretería Los Maestros" })).toBeInTheDocument();
  });

  it("incluye los enlaces secundarios Nosotros, Blog y Contacto con su ruta correcta", () => {
    renderConRouter(<Footer />);

    expect(screen.getByRole("link", { name: "Nosotros" })).toHaveAttribute("href", "/nosotros");
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
    expect(screen.getByRole("link", { name: "Contacto" })).toHaveAttribute("href", "/contacto");
  });
});
