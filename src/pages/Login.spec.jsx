import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderConRouter } from "../test/renderConRouter";
import Login from "./Login";

describe("Login", () => {
  it("[B9] con datos válidos llama a onIngresar con el correo y la contraseña escritos", async () => {
    const usuario = userEvent.setup();
    const onIngresar = vi.fn().mockReturnValue(true);
    renderConRouter(
      <Routes>
        <Route path="/login" element={<Login sesion={null} onIngresar={onIngresar} />} />
      </Routes>,
      { ruta: "/login" }
    );

    await usuario.type(screen.getByLabelText("Correo"), "ana@gmail.com");
    await usuario.type(screen.getByLabelText("Contraseña"), "clave1");
    await usuario.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(onIngresar).toHaveBeenCalledWith("ana@gmail.com", "clave1");
  });
});
