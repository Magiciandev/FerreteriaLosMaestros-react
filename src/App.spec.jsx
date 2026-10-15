import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

// Pruebas de integración: se dibuja la aplicación completa (rutas, estado y base de datos
// simulada) y se comprueba que las piezas trabajan juntas.
function dibujar(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  );
}

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("una dirección desconocida muestra la página no encontrada", () => {
    dibujar("/esta-ruta-no-existe");

    expect(screen.getByRole("heading", { name: "Página no encontrada" })).toBeInTheDocument();
  });

  it("las vistas todavía no construidas muestran Contenido no disponible", () => {
    dibujar("/carrito");

    expect(screen.getByText("Contenido no disponible.")).toBeInTheDocument();
  });

  it("el catálogo se dibuja con los productos de la base de datos simulada", () => {
    dibujar("/productos");

    expect(screen.getByText("85 productos")).toBeInTheDocument();
  });

  it("al agregar un producto sube el contador del carrito, aparece el aviso y se guarda en localStorage", async () => {
    const usuario = userEvent.setup();
    dibujar("/productos");
    expect(screen.getByRole("link", { name: "Carrito 0" })).toBeInTheDocument();

    await usuario.click(screen.getAllByRole("button", { name: /^Agregar/ })[0]);

    expect(screen.getByRole("link", { name: "Carrito 1" })).toBeInTheDocument();
    expect(await screen.findByText(/se agregó al carrito/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("carrito"))).toHaveLength(1);
  });

  it("agregar dos veces el mismo producto suma sus unidades", async () => {
    const usuario = userEvent.setup();
    dibujar("/productos?q=MC001");

    await usuario.click(screen.getByRole("button", { name: /^Agregar/ }));
    await usuario.click(screen.getByRole("button", { name: /^Agregar/ }));

    expect(screen.getByRole("link", { name: "Carrito 2" })).toBeInTheDocument();
  });

  it("con una sesión guardada el encabezado saluda y cerrar sesión la borra", async () => {
    const usuario = userEvent.setup();
    localStorage.setItem("sesionActual", JSON.stringify({ nombre: "Victor Navarrete", tipo: "cliente", rol: "Cliente" }));
    dibujar("/");

    await usuario.click(screen.getByRole("button", { name: "Hola, Victor" }));
    await usuario.click(screen.getByText("Cerrar sesión"));

    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
    expect(localStorage.getItem("sesionActual")).toBeNull();
  });

  it("el formulario de contacto guarda la consulta en la base de datos simulada", async () => {
    const usuario = userEvent.setup();
    dibujar("/contacto");

    await usuario.type(screen.getByLabelText("Nombre"), "Victor");
    await usuario.type(screen.getByLabelText("Correo"), "victor@gmail.com");
    await usuario.type(screen.getByLabelText("Mensaje"), "Necesito cotizar cemento para una obra.");
    await usuario.click(screen.getByRole("button", { name: "Enviar mensaje" }));

    const consultas = JSON.parse(localStorage.getItem("consultas"));
    expect(consultas).toHaveLength(1);
    expect(consultas[0]).toMatchObject({ id: "C001", nombre: "Victor", correo: "victor@gmail.com" });
  });
});
