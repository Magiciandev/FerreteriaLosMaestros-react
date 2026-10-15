import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { categorias, productos } from "../test/datosDePrueba";
import { renderConRouter } from "../test/renderConRouter";
import Productos from "./Productos";

function dibujar(ruta = "/productos", onAgregar = vi.fn()) {
  renderConRouter(
    <Routes>
      <Route path="/productos" element={<Productos productos={productos} categorias={categorias} onAgregar={onAgregar} />} />
    </Routes>,
    { ruta }
  );
  return onAgregar;
}

describe("Productos (catálogo)", () => {
  it("sin filtros muestra todos los productos y su cantidad", () => {
    dibujar();

    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText("4 productos")).toBeInTheDocument();
  });

  it("filtra con el texto que llega en la dirección (?q=)", () => {
    dibujar("/productos?q=cemento");

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: /Cemento Polpaico/ })).toBeInTheDocument();
    expect(screen.getByLabelText("Buscar en el catálogo")).toHaveValue("cemento");
  });

  it("al escribir en el buscador del catálogo cambian los resultados", async () => {
    const usuario = userEvent.setup();
    dibujar();

    await usuario.type(screen.getByLabelText("Buscar en el catálogo"), "taladro");

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("1 producto")).toBeInTheDocument();
  });

  it("al elegir una categoría muestra solo sus productos", async () => {
    const usuario = userEvent.setup();
    dibujar();

    await usuario.selectOptions(screen.getByLabelText("Categoría"), "herramientas");

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("al marcar Solo ofertas muestra únicamente productos con descuento", async () => {
    const usuario = userEvent.setup();
    dibujar();

    await usuario.click(screen.getByLabelText("Solo ofertas"));

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("sin coincidencias muestra un mensaje y ninguna tarjeta", () => {
    dibujar("/productos?q=zzzz");

    expect(screen.getByText("No encontramos productos con esos filtros.")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("Limpiar filtros vuelve a mostrar todos los productos", async () => {
    const usuario = userEvent.setup();
    dibujar("/productos?q=cemento&ofertas=1");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);

    await usuario.click(screen.getByRole("button", { name: "Limpiar filtros" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("pasa a las tarjetas la función para agregar al carrito", async () => {
    const usuario = userEvent.setup();
    const onAgregar = dibujar("/productos?q=cemento");

    await usuario.click(screen.getByRole("button", { name: /Agregar Cemento/ }));

    expect(onAgregar).toHaveBeenCalledWith(expect.objectContaining({ id: "MC001" }));
  });
});
