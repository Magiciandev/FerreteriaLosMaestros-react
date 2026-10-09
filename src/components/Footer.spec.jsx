import { screen } from "@testing-library/react";
import { renderConRouter } from "../test-utils";
import Footer from "./Footer";

describe("Footer", () => {
  it("muestra el nombre de la ferretería", () => {
    renderConRouter(<Footer />);

    expect(screen.getByRole("heading", { name: "Ferretería Los Maestros" })).toBeTruthy();
  });

  it("incluye los enlaces secundarios Nosotros, Blog y Contacto con su ruta correcta", () => {
    renderConRouter(<Footer />);

    expect(screen.getByRole("link", { name: "Nosotros" }).getAttribute("href")).toBe("/nosotros");
    expect(screen.getByRole("link", { name: "Blog" }).getAttribute("href")).toBe("/blog");
    expect(screen.getByRole("link", { name: "Contacto" }).getAttribute("href")).toBe("/contacto");
  });
});
