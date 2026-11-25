import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { iniciarSesionFalsa, instalarApi } from "./test/apiFalsa";
import { irA } from "./test/irA";

// Pruebas del rol VENDEDOR: puede ver la lista y el detalle de productos y de órdenes, y nada más.
// Todo lo demás del panel (dashboard, categorías, usuarios, reportes y las acciones de escritura)
// no debe aparecer en su vista ni se le debe poder abrir escribiendo la dirección.
describe("Panel del vendedor", () => {
  let api;
  beforeEach(() => {
    localStorage.clear();
    api = instalarApi();
    iniciarSesionFalsa("VENDEDOR", "vendedor@duoc.cl");
  });

  it("V1 el menú del vendedor solo tiene Órdenes y Productos", async () => {
    await irA("/admin/ordenes");
    const menu = screen.getByRole("navigation", { name: /menú de administración/i });
    expect(within(menu).getByRole("link", { name: "Órdenes" })).toBeInTheDocument();
    expect(within(menu).getByRole("link", { name: "Productos" })).toBeInTheDocument();
    for (const oculto of ["Dashboard", "Categorías", "Usuarios", "Reportes"]) {
      expect(within(menu).queryByRole("link", { name: oculto })).toBeNull();
    }
  });

  it("V2 al entrar a /admin el vendedor llega a la lista de órdenes, sin pedir los usuarios", async () => {
    await irA("/admin");
    expect(await screen.findByText("3 de 3 órdenes")).toBeInTheDocument();
    expect(api.llamadas.some((llamada) => llamada.metodo === "GET" && llamada.ruta === "/ordenes")).toBe(true);
    expect(api.llamadas.some((llamada) => llamada.ruta === "/usuarios")).toBe(false);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("V3 el vendedor ve el detalle de una orden", async () => {
    await irA("/admin/ordenes/ORD-0001");
    expect(screen.getByText("Taladro percutor 650 W")).toBeInTheDocument();
  });

  it("V4 las páginas de administración muestran el acceso restringido al vendedor", async () => {
    const rutas = ["/admin/usuarios", "/admin/categorias", "/admin/reportes", "/admin/productos/nuevo", "/admin/productos/criticos", "/admin/productos/HE010/editar"];
    for (const ruta of rutas) {
      const { unmount } = await irA(ruta);
      expect(screen.getByRole("heading", { name: /acceso restringido/i })).toBeInTheDocument();
      unmount();
    }
  });

  it("V5 la lista de productos del vendedor es de solo lectura", async () => {
    await irA("/admin/productos");
    expect(screen.getAllByRole("link", { name: /^ver /i }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /^editar /i })).toBeNull();
    expect(screen.queryByRole("button", { name: /^eliminar /i })).toBeNull();
    expect(screen.queryByRole("link", { name: "Nuevo producto" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Stock crítico" })).toBeNull();
  });

  it("V6 la ficha de un producto no ofrece editarlo al vendedor", async () => {
    await irA("/admin/productos/HE010");
    expect(screen.getByText("Taladro percutor 650 W")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al listado" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Editar producto" })).toBeNull();
  });

  it("V7 al iniciar sesión el vendedor entra al panel y ve el enlace «Panel de ventas»", async () => {
    sessionStorage.clear();
    const usuario = userEvent.setup();
    await irA("/login");
    await usuario.type(screen.getByLabelText("Correo"), "vendedor@duoc.cl");
    await usuario.type(screen.getByLabelText("Contraseña"), "Cambiar123!");
    await usuario.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    expect(await screen.findByRole("navigation", { name: /menú de administración/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Panel de ventas" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Administración" })).toBeNull();
  });
});
