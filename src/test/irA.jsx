import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

// Dibuja la aplicación en una ruta y espera a que termine de cargar los datos del servidor
// (mientras carga se ve el indicador "Cargando").
export async function irA(ruta) {
  const resultado = render(<MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>);
  await waitFor(() => expect(screen.queryByRole("status", { name: "Cargando" })).toBeNull());
  return resultado;
}
