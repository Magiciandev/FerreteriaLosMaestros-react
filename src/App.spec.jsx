import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

// Prueba de integración: se dibuja la aplicación completa (rutas, estado y base de datos
// simulada) y se comprueba que las piezas trabajan juntas.
describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("[A2] al agregar un producto sube el contador del carrito, aparece el aviso y se guarda en localStorage", async () => {
    const usuario = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/productos"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: "Carrito 0" })).toBeInTheDocument();

    await usuario.click(screen.getAllByRole("button", { name: /^Agregar/ })[0]);

    expect(screen.getByRole("link", { name: "Carrito 1" })).toBeInTheDocument();
    expect(await screen.findByText(/se agregó al carrito/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("carrito"))).toHaveLength(1);
  });
});
