import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contacto from "./Contacto";

describe("Contacto", () => {
  it("A9 enviar el formulario vacío muestra los errores y no registra la consulta", async () => {
    const usuario = userEvent.setup();
    const onEnviar = vi.fn();
    render(<Contacto onEnviar={onEnviar} />);

    await usuario.click(screen.getByRole("button", { name: /enviar mensaje/i }));

    expect(screen.getByText(/el nombre es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/correo inválido/i)).toBeInTheDocument();
    expect(screen.getByText(/entre 20 y 500 caracteres\)/i)).toBeInTheDocument();
    expect(onEnviar).not.toHaveBeenCalled();
  });

  it("A10 una consulta válida se registra sin espacios sobrantes y confirma al cliente", async () => {
    const usuario = userEvent.setup();
    const onEnviar = vi.fn();
    render(<Contacto onEnviar={onEnviar} />);

    await usuario.type(screen.getByLabelText("Nombre"), "  Ana  ");
    await usuario.type(screen.getByLabelText("Correo"), "ana@gmail.com");
    await usuario.type(screen.getByLabelText("Mensaje"), "Necesito cotizar cemento para una obra.");
    await usuario.click(screen.getByRole("button", { name: /enviar mensaje/i }));

    expect(onEnviar).toHaveBeenCalledWith({ nombre: "Ana", correo: "ana@gmail.com", mensaje: "Necesito cotizar cemento para una obra." });
    expect(screen.getByRole("status")).toHaveTextContent(/gracias por escribirnos/i);
  });
});
