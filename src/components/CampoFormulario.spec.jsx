import { render, screen } from "@testing-library/react";
import CampoFormulario from "./CampoFormulario";

describe("CampoFormulario", () => {
  it("[B7] muestra el mensaje de error solo cuando hay error y lo asocia al campo", () => {
    const { rerender } = render(
      <CampoFormulario id="correo" etiqueta="Correo" valor="" error="Correo inválido." onChange={() => {}} />
    );
    const campo = screen.getByLabelText("Correo");

    expect(screen.getByText("Correo inválido.")).toBeInTheDocument();
    expect(campo).toHaveAttribute("aria-invalid", "true");
    expect(campo).toHaveAttribute("aria-describedby", "correo-error");

    rerender(<CampoFormulario id="correo" etiqueta="Correo" valor="" error="" onChange={() => {}} />);

    expect(screen.queryByText("Correo inválido.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Correo")).toHaveAttribute("aria-invalid", "false");
  });
});
