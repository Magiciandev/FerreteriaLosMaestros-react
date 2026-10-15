import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { categorias, productos } from "../../test/datosDePrueba";
import { renderConRouter } from "../../test/renderConRouter";
import AdminCategorias from "./AdminCategorias";

// Una categoría sin productos, para poder probar la eliminación.
const jardin = { slug: "jardin", label: "Jardín y Exterior" };

function dibujar({ lista = [...categorias, jardin], onEliminar = vi.fn() } = {}) {
  renderConRouter(<AdminCategorias categorias={lista} productos={productos} onEliminar={onEliminar} />);
  return { onEliminar };
}

describe("AdminCategorias", () => {
  it("muestra una fila por categoría con su identificador y su cantidad de productos", () => {
    dibujar();

    const fila = screen.getByRole("row", { name: /Herramientas/ });
    expect(within(fila).getByText("herramientas")).toBeInTheDocument();
    expect(within(fila).getByText("2")).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /Jardín y Exterior/ })).toBeInTheDocument();
  });

  it("enlaza a crear y a editar cada categoría", () => {
    dibujar();

    expect(screen.getByRole("link", { name: "Nueva categoría" })).toHaveAttribute("href", "/admin/categorias/nueva");
    expect(screen.getByRole("link", { name: "Editar Herramientas" })).toHaveAttribute(
      "href",
      "/admin/categorias/herramientas/editar"
    );
  });

  it("no deja eliminar una categoría que tiene productos", () => {
    dibujar();

    expect(screen.getByRole("button", { name: "Eliminar Herramientas" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Eliminar Jardín y Exterior" })).toBeEnabled();
  });

  it("pide confirmación y, al confirmar, elimina la categoría y lo avisa", async () => {
    const usuario = userEvent.setup();
    const { onEliminar } = dibujar();

    await usuario.click(screen.getByRole("button", { name: "Eliminar Jardín y Exterior" }));
    expect(onEliminar).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toHaveTextContent("Jardín y Exterior");

    await usuario.click(screen.getByRole("button", { name: "Eliminar categoría" }));

    expect(onEliminar).toHaveBeenCalledWith("jardin");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent('La categoría "Jardín y Exterior" se eliminó.');
  });

  it("al cancelar la confirmación no elimina nada", async () => {
    const usuario = userEvent.setup();
    const { onEliminar } = dibujar();

    await usuario.click(screen.getByRole("button", { name: "Eliminar Jardín y Exterior" }));
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onEliminar).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("con la lista vacía muestra un aviso en la tabla", () => {
    dibujar({ lista: [] });

    expect(screen.getByText("Todavía no hay categorías.")).toBeInTheDocument();
  });

  it("muestra el mensaje que deja el formulario al guardar", () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: "/admin/categorias", state: { mensaje: 'La categoría "Madera" se creó.' } }]}>
        <AdminCategorias categorias={categorias} productos={productos} onEliminar={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByRole("status")).toHaveTextContent('La categoría "Madera" se creó.');
  });
});