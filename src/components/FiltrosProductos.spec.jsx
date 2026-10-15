import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FiltrosProductos from "./FiltrosProductos";

const categorias = [
  { slug: "construccion", label: "Construcción" },
  { slug: "herramientas", label: "Herramientas" },
];

function dibujar(props = {}) {
  const funciones = { onCambiar: vi.fn(), onLimpiar: vi.fn() };
  render(<FiltrosProductos categorias={categorias} texto="" categoria="" soloOfertas={false} {...funciones} {...props} />);
  return funciones;
}

describe("FiltrosProductos", () => {
  it("muestra los valores recibidos por props", () => {
    dibujar({ texto: "cemento", categoria: "herramientas", soloOfertas: true });

    expect(screen.getByLabelText("Buscar en el catálogo")).toHaveValue("cemento");
    expect(screen.getByLabelText("Categoría")).toHaveValue("herramientas");
    expect(screen.getByLabelText("Solo ofertas")).toBeChecked();
  });

  it("ofrece la opción Todas más una opción por categoría", () => {
    dibujar();

    expect(screen.getAllByRole("option")).toHaveLength(categorias.length + 1);
    expect(screen.getByRole("option", { name: "Todas" })).toBeInTheDocument();
  });

  it("al escribir en el buscador avisa el texto con onCambiar", async () => {
    const usuario = userEvent.setup();
    const { onCambiar } = dibujar();

    await usuario.type(screen.getByLabelText("Buscar en el catálogo"), "c");

    expect(onCambiar).toHaveBeenCalledWith("texto", "c");
  });

  it("al elegir una categoría avisa su slug", async () => {
    const usuario = userEvent.setup();
    const { onCambiar } = dibujar();

    await usuario.selectOptions(screen.getByLabelText("Categoría"), "herramientas");

    expect(onCambiar).toHaveBeenCalledWith("categoria", "herramientas");
  });

  it("al marcar Solo ofertas avisa true", async () => {
    const usuario = userEvent.setup();
    const { onCambiar } = dibujar();

    await usuario.click(screen.getByLabelText("Solo ofertas"));

    expect(onCambiar).toHaveBeenCalledWith("soloOfertas", true);
  });

  it("el botón Limpiar filtros ejecuta onLimpiar", async () => {
    const usuario = userEvent.setup();
    const { onLimpiar } = dibujar();

    await usuario.click(screen.getByRole("button", { name: "Limpiar filtros" }));

    expect(onLimpiar).toHaveBeenCalledTimes(1);
  });
});
