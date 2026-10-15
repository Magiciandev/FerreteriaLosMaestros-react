import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { categorias, productos } from "../test/datosDePrueba";
import { renderConRouter } from "../test/renderConRouter";
import Productos from "./Productos";

describe("Productos (catálogo)", () => {
  it("[A8] al escribir en el buscador del catálogo cambian los resultados mostrados", async () => {
    const usuario = userEvent.setup();
    renderConRouter(
      <Routes>
        <Route path="/productos" element={<Productos productos={productos} categorias={categorias} onAgregar={() => {}} />} />
      </Routes>,
      { ruta: "/productos" }
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(4);

    await usuario.type(screen.getByLabelText("Buscar en el catálogo"), "taladro");

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("1 producto")).toBeInTheDocument();
  });
});
