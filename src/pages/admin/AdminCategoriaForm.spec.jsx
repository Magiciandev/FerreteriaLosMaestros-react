import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { categorias } from "../../test/datosDePrueba";
import { renderConRouter } from "../../test/renderConRouter";
/*import AdminCategoriaForm from "./AdminCategoriaForm"; */

// El formulario lee :id de la dirección, por eso se dibuja dentro de rutas reales. Al guardar
// navega al listado, que aquí es solo un texto para poder comprobar que llegó.
function dibujar({ ruta = "/admin/categorias/nueva", onCrear = vi.fn(), onActualizar = vi.fn() } = {}) {
  const formulario = <AdminCategoriaForm categorias={categorias} onCrear={onCrear} onActualizar={onActualizar} />;
  renderConRouter(
    <Routes>
      <Route path="/admin/categorias/nueva" element={formulario} />
      <Route path="/admin/categorias/:id/editar" element={formulario} />
      <Route path="/admin/categorias" element={<p>Listado de categorías</p>} />
    </Routes>,
    { ruta }
  );
  return { onCrear, onActualizar };
}

describe("AdminCategoriaForm - nueva categoría", () => {
  it("al enviar vacío muestra un error por campo y no crea nada", async () => {
    const usuario = userEvent.setup();
    const { onCrear } = dibujar();

    await usuario.click(screen.getByRole("button", { name: "Crear categoría" }));

    expect(screen.getByText(/Identificador inválido/)).toBeInTheDocument();
    expect(screen.getByText("El nombre es obligatorio (máximo 60 caracteres).")).toBeInTheDocument();
    expect(onCrear).not.toHaveBeenCalled();
  });

  it("con datos válidos llama a onCrear y vuelve al listado", async () => {
    const usuario = userEvent.setup();
    const { onCrear } = dibujar();

    await usuario.type(screen.getByLabelText("Identificador"), "pinturas-y-barnices");
    await usuario.type(screen.getByLabelText("Nombre"), "Pinturas y Barnices");
    await usuario.click(screen.getByRole("button", { name: "Crear categoría" }));

    expect(onCrear).toHaveBeenCalledWith({ slug: "pinturas-y-barnices", label: "Pinturas y Barnices" });
    expect(screen.getByText("Listado de categorías")).toBeInTheDocument();
  });

  it("rechaza un identificador que ya existe", async () => {
    const usuario = userEvent.setup();
    const { onCrear } = dibujar();

    await usuario.type(screen.getByLabelText("Identificador"), "herramientas");
    await usuario.type(screen.getByLabelText("Nombre"), "Otra");
    await usuario.click(screen.getByRole("button", { name: "Crear categoría" }));

    expect(screen.getByText("Ya existe una categoría con ese identificador.")).toBeInTheDocument();
    expect(onCrear).not.toHaveBeenCalled();
  });

  it("muestra el error de formato al salir del campo y lo quita al corregir", async () => {
    const usuario = userEvent.setup();
    dibujar();
    const slug = screen.getByLabelText("Identificador");

    await usuario.type(slug, "Con Espacios");
    await usuario.tab();
    expect(screen.getByText(/Identificador inválido/)).toBeInTheDocument();

    await usuario.clear(slug);
    await usuario.type(slug, "con-espacios");
    expect(screen.queryByText(/Identificador inválido/)).not.toBeInTheDocument();
  });

  it("si la base de datos rechaza el identificador, muestra ese error y no sale del formulario", async () => {
    const usuario = userEvent.setup();
    const onCrear = vi.fn(() => {
      throw new Error('Ya existe un registro con slug "madera".');
    });
    dibujar({ onCrear });

    await usuario.type(screen.getByLabelText("Identificador"), "madera");
    await usuario.type(screen.getByLabelText("Nombre"), "Madera");
    await usuario.click(screen.getByRole("button", { name: "Crear categoría" }));

    expect(screen.getByText('Ya existe un registro con slug "madera".')).toBeInTheDocument();
    expect(screen.queryByText("Listado de categorías")).not.toBeInTheDocument();
  });
});

describe("AdminCategoriaForm - editar categoría", () => {
  it("precarga el nombre y deja el identificador bloqueado", () => {
    dibujar({ ruta: "/admin/categorias/herramientas/editar" });

    expect(screen.getByRole("heading", { name: "Editar categoría" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Herramientas");
    expect(screen.getByLabelText("Identificador")).toHaveValue("herramientas");
    expect(screen.getByLabelText("Identificador")).toBeDisabled();
  });

  it("al guardar llama a onActualizar con el slug y el nombre nuevo, y vuelve al listado", async () => {
    const usuario = userEvent.setup();
    const { onActualizar } = dibujar({ ruta: "/admin/categorias/herramientas/editar" });
    const nombre = screen.getByLabelText("Nombre");

    await usuario.clear(nombre);
    await usuario.type(nombre, "Herramientas y más");
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(onActualizar).toHaveBeenCalledWith("herramientas", { label: "Herramientas y más" });
    expect(screen.getByText("Listado de categorías")).toBeInTheDocument();
  });

  it("no guarda si el nombre queda vacío", async () => {
    const usuario = userEvent.setup();
    const { onActualizar } = dibujar({ ruta: "/admin/categorias/herramientas/editar" });

    await usuario.clear(screen.getByLabelText("Nombre"));
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(screen.getByText("El nombre es obligatorio (máximo 60 caracteres).")).toBeInTheDocument();
    expect(onActualizar).not.toHaveBeenCalled();
  });

  it("si la categoría no existe avisa y ofrece volver al listado", () => {
    dibujar({ ruta: "/admin/categorias/no-existe/editar" });

    expect(screen.getByText(/No encontramos la categoría/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al listado" })).toHaveAttribute("href", "/admin/categorias");
  });
});