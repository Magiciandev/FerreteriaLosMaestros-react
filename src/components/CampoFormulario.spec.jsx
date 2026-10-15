import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CampoFormulario from "./CampoFormulario";

describe("CampoFormulario", () => {
  it("asocia la etiqueta con el campo y muestra el valor recibido", () => {
    render(<CampoFormulario id="nombre" etiqueta="Nombre" valor="Victor" onChange={() => {}} />);

    expect(screen.getByLabelText("Nombre")).toHaveValue("Victor");
  });

  it("sin error, el campo no se marca como inválido", () => {
    render(<CampoFormulario id="nombre" etiqueta="Nombre" valor="" onChange={() => {}} />);
    const campo = screen.getByLabelText("Nombre");

    expect(campo).toHaveAttribute("aria-invalid", "false");
    expect(campo).not.toHaveAttribute("aria-describedby");
  });

  it("con error, muestra el mensaje y lo asocia al campo para lectores de pantalla", () => {
    render(<CampoFormulario id="correo" etiqueta="Correo" valor="" error="Correo inválido." onChange={() => {}} />);
    const campo = screen.getByLabelText("Correo");

    expect(screen.getByText("Correo inválido.")).toBeInTheDocument();
    expect(campo).toHaveAttribute("aria-invalid", "true");
    expect(campo).toHaveAttribute("aria-describedby", "correo-error");
  });

  it("avisa cada cambio con la función onChange", async () => {
    const usuario = userEvent.setup();
    const onChange = vi.fn();
    render(<CampoFormulario id="nombre" etiqueta="Nombre" valor="" onChange={onChange} />);

    await usuario.type(screen.getByLabelText("Nombre"), "ab");

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("puede mostrarse como área de texto y con un texto de ayuda", () => {
    render(<CampoFormulario id="mensaje" etiqueta="Mensaje" como="textarea" filas={4} valor="" ayuda="Máximo 500 caracteres." onChange={() => {}} />);

    expect(screen.getByLabelText("Mensaje").tagName).toBe("TEXTAREA");
    expect(screen.getByText("Máximo 500 caracteres.")).toBeInTheDocument();
  });
});
