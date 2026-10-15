import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderConRouter } from "../test/renderConRouter";
import Header from "./Header";

const categorias = [{ slug: "herramientas", label: "Herramientas" }];
const cliente = { nombre: "Victor Navarrete", tipo: "cliente", rol: "Cliente" };

describe("Header", () => {
  it("[B5] con sesión saluda con el primer nombre y reemplaza al botón Ingresar", () => {
    renderConRouter(<Header categorias={categorias} sesion={cliente} />);

    expect(screen.getByRole("button", { name: "Hola, Victor" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ingresar" })).not.toBeInTheDocument();
  });

  it("[B6] al pulsar Cerrar sesión ejecuta la función recibida por props", async () => {
    const usuario = userEvent.setup();
    const onCerrarSesion = vi.fn();
    renderConRouter(<Header categorias={categorias} sesion={cliente} onCerrarSesion={onCerrarSesion} />);

    await usuario.click(screen.getByRole("button", { name: "Hola, Victor" }));
    await usuario.click(screen.getByText("Cerrar sesión"));

    expect(onCerrarSesion).toHaveBeenCalledTimes(1);
  });
});
