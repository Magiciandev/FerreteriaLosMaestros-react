import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderConRouter } from "../test/renderConRouter";
import Contacto from "./Contacto";

const MENSAJE_VALIDO = "Necesito cotizar cemento para una obra pequeña.";

async function completar(usuario, { nombre = "Victor", correo = "victor@gmail.com", mensaje = MENSAJE_VALIDO } = {}) {
  await usuario.type(screen.getByLabelText("Nombre"), nombre);
  await usuario.type(screen.getByLabelText("Correo"), correo);
  await usuario.type(screen.getByLabelText("Mensaje"), mensaje);
}

describe("Contacto", () => {
  it("al enviar vacío muestra un error por campo y no envía nada", async () => {
    const usuario = userEvent.setup();
    const onEnviar = vi.fn();
    renderConRouter(<Contacto onEnviar={onEnviar} />);

    await usuario.click(screen.getByRole("button", { name: "Enviar mensaje" }));

    expect(screen.getByText("El nombre es obligatorio (máximo 100 caracteres).")).toBeInTheDocument();
    expect(screen.getByText(/Correo inválido/)).toBeInTheDocument();
    expect(screen.getByText(/Cuéntanos qué necesitas/)).toBeInTheDocument();
    expect(onEnviar).not.toHaveBeenCalled();
  });

  it("al enviar datos válidos llama a onEnviar, avisa el éxito y limpia el formulario", async () => {
    const usuario = userEvent.setup();
    const onEnviar = vi.fn();
    renderConRouter(<Contacto onEnviar={onEnviar} />);

    await completar(usuario);
    await usuario.click(screen.getByRole("button", { name: "Enviar mensaje" }));

    expect(onEnviar).toHaveBeenCalledWith({ nombre: "Victor", correo: "victor@gmail.com", mensaje: MENSAJE_VALIDO });
    expect(screen.getByRole("status")).toHaveTextContent("Gracias por escribirnos");
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
  });

  it("muestra el error de un campo al salir de él con un valor inválido", async () => {
    const usuario = userEvent.setup();
    renderConRouter(<Contacto onEnviar={() => {}} />);

    await usuario.type(screen.getByLabelText("Correo"), "victor@hotmail.com");
    await usuario.tab();

    expect(screen.getByText(/Correo inválido/)).toBeInTheDocument();
  });

  it("el error desaparece apenas el valor se corrige", async () => {
    const usuario = userEvent.setup();
    renderConRouter(<Contacto onEnviar={() => {}} />);
    const correo = screen.getByLabelText("Correo");

    await usuario.type(correo, "victor@hotmail.com");
    await usuario.tab();
    expect(screen.getByText(/Correo inválido/)).toBeInTheDocument();

    await usuario.clear(correo);
    await usuario.type(correo, "victor@gmail.com");

    expect(screen.queryByText(/Correo inválido/)).not.toBeInTheDocument();
  });

  it("el contador de caracteres del mensaje se actualiza al escribir", async () => {
    const usuario = userEvent.setup();
    renderConRouter(<Contacto onEnviar={() => {}} />);

    await usuario.type(screen.getByLabelText("Mensaje"), "hola");

    expect(screen.getByText("Entre 20 y 500 caracteres (4/500).")).toBeInTheDocument();
  });
});
