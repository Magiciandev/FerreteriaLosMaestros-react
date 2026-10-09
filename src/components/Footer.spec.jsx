import { screen } from "@testing-library/react";
import { renderConRouter } from "../test-utils";
import Footer from "./Footer";

describe("Footer", () => {
  it("muestra el nombre de la ferretería", () => {
    renderConRouter(<Footer />);

    expect(screen.getByRole("heading", { name: "Ferretería Los Maestros" })).toBeTruthy();
  });

  it("incluye enlaces a Contacto y Nosotros con su ruta correcta", () => {
    renderConRouter(<Footer />);

    expect(screen.getByRole("link", { name: "Contacto" }).getAttribute("href")).toBe("/contacto");
    expect(screen.getByRole("link", { name: "Nosotros" }).getAttribute("href")).toBe("/nosotros");
  });
});
