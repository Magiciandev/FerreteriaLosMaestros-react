import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Los componentes que usan <Link>, <NavLink> o useNavigate necesitan un Router.
// En las pruebas se usa MemoryRouter: un router que vive en memoria, sin tocar la URL real.
export function renderConRouter(ui, { ruta = "/" } = {}) {
  return render(<MemoryRouter initialEntries={[ruta]}>{ui}</MemoryRouter>);
}
