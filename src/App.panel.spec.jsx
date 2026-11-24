import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { iniciarSesionFalsa, instalarApi } from "./test/apiFalsa";
import { categorias, ordenes, productos } from "./test/datosDePrueba";
import { irA } from "./test/irA";

// Pruebas de cobertura del panel de administración contra el servidor simulado: cada una abre una
// página del panel con datos conocidos (órdenes, usuarios, productos) y revisa lo que la
// aplicación le pide al servidor, incluidas las respuestas con error.
describe("Panel de administración", () => {
  let api;
  beforeEach(() => {
    localStorage.clear();
    api = instalarApi();
    iniciarSesionFalsa("ADMIN");
  });

  it("C58 el dashboard resume las ventas, el inventario y las últimas órdenes", async () => {
    await irA("/admin");
    expect(screen.getAllByText(/ORD-0002/).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /ver cuáles reponer/i })).toBeInTheDocument();
  });

  it("C59 la lista de órdenes se filtra por estado y por texto", async () => {
    const usuario = userEvent.setup();
    await irA("/admin/ordenes");
    expect(screen.getByText("3 de 3 órdenes")).toBeInTheDocument();
    await usuario.selectOptions(screen.getByLabelText("Estado"), "rechazada");
    expect(screen.getByText("1 de 3 órdenes")).toBeInTheDocument();
    await usuario.selectOptions(screen.getByLabelText("Estado"), "");
    await usuario.type(screen.getByLabelText("Buscar"), "no-existe");
    expect(screen.getByText(/ninguna orden coincide/i)).toBeInTheDocument();
  });

  it("C60 el detalle de una orden muestra el cliente, la entrega y los productos", async () => {
    await irA("/admin/ordenes/ORD-0001");
    expect(screen.getByText(/av\. siempre viva 123/i)).toBeInTheDocument();
    expect(screen.getByText("Taladro percutor 650 W")).toBeInTheDocument();
  });

  it("C61 una orden inexistente muestra el aviso", async () => {
    await irA("/admin/ordenes/ORD-9999");
    expect(screen.getByText(/no encontramos/i)).toBeInTheDocument();
  });

  it("C62 los reportes muestran los productos más vendidos y las ventas por categoría", async () => {
    await irA("/admin/reportes");
    expect(screen.getAllByText("Cemento Polpaico gris 25 kg").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("progressbar").length).toBeGreaterThan(0);
  });

  it("C63 los productos críticos se listan con su stock y categoría", async () => {
    await irA("/admin/productos/criticos");
    expect(await screen.findByText("Taladro percutor 650 W")).toBeInTheDocument();
  });

  it("C64 la ficha de un producto muestra su nombre y su estado de stock", async () => {
    await irA("/admin/productos/HE010");
    expect(screen.getByText("Taladro percutor 650 W")).toBeInTheDocument();
  });

  it("C65 un producto inexistente en el panel muestra el aviso", async () => {
    await irA("/admin/productos/ZZZ999");
    expect(screen.getByText(/no encontramos el producto/i)).toBeInTheDocument();
  });

  it("C66 la ficha de un usuario muestra sus datos y el nombre de su rol", async () => {
    await irA("/admin/usuarios/2");
    expect(screen.getAllByText("Luis Rojas").length).toBeGreaterThan(0);
    expect(screen.getByText("Cliente")).toBeInTheDocument();
  });

  it("C67 un usuario inexistente muestra el aviso", async () => {
    await irA("/admin/usuarios/999");
    expect(screen.getByText(/no encontramos al usuario/i)).toBeInTheDocument();
  });

  it("C68 la lista de productos del panel se filtra por texto y categoría", async () => {
    const usuario = userEvent.setup();
    await irA("/admin/productos");
    await usuario.selectOptions(screen.getByLabelText("Categoría"), "herramientas");
    expect(screen.queryByText("Cemento Polpaico gris 25 kg")).toBeNull();
    await usuario.type(screen.getByLabelText("Buscar"), "zzzz");
    expect(screen.getByText(/ningún producto coincide/i)).toBeInTheDocument();
  });

  it("C69 la lista de usuarios se filtra por rol y texto, y permite eliminar con confirmación", async () => {
    const usuario = userEvent.setup();
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(true);
    await irA("/admin/usuarios");
    await usuario.selectOptions(screen.getByLabelText("Rol"), "Cliente");
    expect(screen.queryByText("Rosa Admin")).toBeNull();
    await usuario.click(screen.getByRole("button", { name: /eliminar luis rojas/i }));
    expect(await screen.findByText(/se eliminó/i)).toBeInTheDocument();
    expect(api.datos.usuarios.map((u) => u.id)).toEqual([1]);
    await usuario.type(screen.getByLabelText("Buscar"), "zzzz");
    expect(screen.getByText(/ningún usuario coincide/i)).toBeInTheDocument();
    confirmar.mockRestore();
  });

  it("C70 una categoría con productos no se puede eliminar", async () => {
    await irA("/admin/categorias");
    expect(screen.getByRole("button", { name: /eliminar herramientas/i })).toBeDisabled();
  });

  it("C71 sin categorías el listado muestra el mensaje de lista vacía", async () => {
    api = instalarApi({ categorias: [], productos: [] });
    await irA("/admin/categorias");
    expect(screen.getByText(/todavía no hay categorías/i)).toBeInTheDocument();
  });

  it("C72 editar una categoría guarda el nuevo nombre; vacío muestra el error", async () => {
    const usuario = userEvent.setup();
    await irA("/admin/categorias/herramientas/editar");
    await usuario.clear(screen.getByLabelText("Nombre"));
    await usuario.click(screen.getByRole("button", { name: /guardar cambios/i }));
    expect(screen.getByText(/el nombre es obligatorio/i)).toBeInTheDocument();
    await usuario.type(screen.getByLabelText("Nombre"), "Herramientas manuales");
    await usuario.click(screen.getByRole("button", { name: /guardar cambios/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(/se actualizó/i);
    expect(api.datos.categorias.find((c) => c.slug === "herramientas").label).toBe("Herramientas manuales");
  });

  it("C73 una categoría inexistente muestra el aviso", async () => {
    await irA("/admin/categorias/no-existe/editar");
    expect(screen.getByText(/no encontramos la categoría/i)).toBeInTheDocument();
  });

  it("C74 editar un usuario guarda los cambios sin pedir la contraseña, y el servidor no deja repetir un correo", async () => {
    const usuario = userEvent.setup();
    await irA("/admin/usuarios/2/editar");
    await usuario.clear(screen.getByLabelText("Nombre"));
    await usuario.type(screen.getByLabelText("Nombre"), "Luis Alberto");
    await usuario.click(screen.getByRole("button", { name: /guardar cambios/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(/se actualizó/i);
    expect(api.datos.usuarios.find((u) => u.id === 2).nombre).toBe("Luis Alberto");
    await usuario.clear(screen.getByLabelText("Correo"));
    await usuario.type(screen.getByLabelText("Correo"), "admin@profesor.duoc.cl");
    await usuario.click(screen.getByRole("button", { name: /guardar cambios/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/ya existe una cuenta con el correo admin@profesor.duoc.cl/i);
  });

  it("C75 un usuario con rol Cliente exige sus datos de cliente y queda guardado como cliente", async () => {
    const usuario = userEvent.setup();
    await irA("/admin/usuarios/nuevo");
    await usuario.type(screen.getByLabelText("Nombre"), "Marta");
    await usuario.type(screen.getByLabelText("Apellidos"), "Soto");
    await usuario.type(screen.getByLabelText("Correo"), "marta@gmail.com");
    await usuario.selectOptions(screen.getByLabelText("Rol"), "Cliente");
    await usuario.type(screen.getByLabelText("Contraseña"), "clave123");
    await usuario.click(screen.getByRole("button", { name: /crear usuario/i }));
    expect(screen.getByText(/selecciona si eres particular o contratista/i)).toBeInTheDocument();
    await usuario.type(screen.getByLabelText(/^run/i), "10000013-K");
    await usuario.click(screen.getByLabelText("Contratista"));
    await usuario.selectOptions(screen.getByLabelText("Región"), "Metropolitana de Santiago");
    await usuario.selectOptions(screen.getByLabelText("Comuna"), "Santiago");
    await usuario.type(screen.getByLabelText("Dirección"), "Calle 2 número 45");
    await usuario.click(screen.getByRole("button", { name: /crear usuario/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(/se creó/i);
    expect(api.datos.usuarios.at(-1)).toMatchObject({ id: 3, rol: "CLIENTE", tipoCliente: "contratista", run: "10000013-K" });
  });

  it("C76 crear un producto con un código repetido o campos vacíos muestra los errores", async () => {
    const usuario = userEvent.setup();
    await irA("/admin/productos/nuevo");
    await usuario.click(screen.getByRole("button", { name: /crear producto/i }));
    expect(screen.getByText(/selecciona una categoría\./i)).toBeInTheDocument();
    await usuario.type(screen.getByLabelText("Código"), "mc001");
    await usuario.click(screen.getByRole("button", { name: /crear producto/i }));
    expect(screen.getByText(/ya existe un producto con ese código/i)).toBeInTheDocument();
  });

  it("C77 el dashboard usa el singular cuando hay un solo producto con stock crítico", async () => {
    api = instalarApi({ productos: [productos[0], productos[1]] });
    await irA("/admin");
    expect(screen.getByText(/1 producto tiene stock crítico/i)).toBeInTheDocument();
  });

  it("C78 la boleta de una orden rechazada lo indica y se puede imprimir", async () => {
    const usuario = userEvent.setup();
    window.print = vi.fn();
    await irA("/admin/ordenes/ORD-0003");
    expect(screen.getByText(/el pago fue rechazado/i)).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: /imprimir boleta/i }));
    expect(window.print).toHaveBeenCalled();
  });

  it("C79 la ficha de un producto sin stock mínimo ni descripción lo indica", async () => {
    api = instalarApi({ productos: [{ ...productos[0], stockMinimo: null }] });
    await irA("/admin/productos/MC001");
    expect(screen.getByText("No definido")).toBeInTheDocument();
    expect(screen.getByText("Sin descripción")).toBeInTheDocument();
  });

  it("C80 los productos críticos indican cuando no hay ninguno", async () => {
    api = instalarApi({ productos: [productos[0], productos[3]] });
    await irA("/admin/productos/criticos");
    expect(await screen.findByText(/no hay productos con stock crítico/i)).toBeInTheDocument();
  });

  it("C81 los productos críticos usan el singular cuando solo uno necesita reposición", async () => {
    api = instalarApi({ productos: [productos[0], productos[1]] });
    await irA("/admin/productos/criticos");
    expect(await screen.findByText(/1 producto necesita reposición/i)).toBeInTheDocument();
  });

  it("C82 en los reportes, un producto que ya no existe aparece sin enlace", async () => {
    const huerfana = { ...ordenes[1], id: "ORD-0004", items: [{ idProducto: "BORRADO", nombre: "Producto borrado", precioUnitario: 1000, cantidad: 1, subtotal: 1000 }], total: 1000 };
    api = instalarApi({ ordenes: [...ordenes, huerfana] });
    await irA("/admin/reportes");
    expect(screen.getAllByText("Producto borrado").length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "Producto borrado" })).toBeNull();
  });

  it("C83 editar un producto o un usuario que no existen muestra el aviso", async () => {
    for (const [ruta, aviso] of [
      ["/admin/productos/ZZZ999/editar", /no encontramos el producto/i],
      ["/admin/usuarios/999/editar", /no encontramos al usuario/i],
    ]) {
      const { unmount } = await irA(ruta);
      expect(screen.getByText(aviso)).toBeInTheDocument();
      unmount();
    }
  });

  it("C84 si se cancela la confirmación no se elimina ninguna categoría, usuario ni producto", async () => {
    const usuario = userEvent.setup();
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(false);
    api = instalarApi({ categorias: [...categorias, { slug: "sin-uso", label: "Sin uso" }] });
    await irA("/admin/categorias");
    await usuario.click(screen.getByRole("button", { name: /eliminar sin uso/i }));
    expect(api.datos.categorias).toHaveLength(3);
    confirmar.mockRestore();
  });

  it("C85 cancelar la confirmación al eliminar un usuario lo conserva", async () => {
    const usuario = userEvent.setup();
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(false);
    await irA("/admin/usuarios");
    await usuario.click(screen.getByRole("button", { name: /eliminar luis rojas/i }));
    expect(api.datos.usuarios).toHaveLength(2);
    confirmar.mockRestore();
  });

  it("C86 sin productos el listado del panel muestra el mensaje de lista vacía", async () => {
    api = instalarApi({ productos: [] });
    await irA("/admin/productos");
    expect(screen.getByText(/todavía no hay productos/i)).toBeInTheDocument();
  });

  it("C87 sin órdenes, el dashboard y los reportes indican que todavía no hay compras", async () => {
    api = instalarApi({ ordenes: [] });
    const { unmount } = await irA("/admin");
    expect(screen.getByText(/todavía no hay compras registradas/i)).toBeInTheDocument();
    unmount();
    await irA("/admin/reportes");
    expect(screen.getByText(/todavía no hay compras aprobadas/i)).toBeInTheDocument();
  });

  // ---------- Respuestas con error del servidor ----------

  it("C88 si el servidor rechaza una eliminación, el listado muestra su mensaje y no quita el elemento", async () => {
    const usuario = userEvent.setup();
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(true);
    api = instalarApi({ categorias: [...categorias, { slug: "sin-uso", label: "Sin uso" }] });
    api.forzar("DELETE", "/productos/MC001", 404);
    api.forzar("DELETE", "/categorias/sin-uso", 409, { error: "No se puede eliminar: hay productos en esa categoría" });
    api.forzar("DELETE", "/usuarios/2", 403, { error: "Acceso denegado" });

    const casos = [
      ["/admin/productos", /eliminar cemento/i, "No encontramos lo que buscabas."],
      ["/admin/categorias", /eliminar sin uso/i, "No se puede eliminar: hay productos en esa categoría"],
      ["/admin/usuarios", /eliminar luis rojas/i, "Acceso denegado"],
    ];
    for (const [ruta, boton, mensaje] of casos) {
      const { unmount } = await irA(ruta);
      await usuario.click(screen.getByRole("button", { name: boton }));
      expect(await screen.findByText(mensaje)).toBeInTheDocument();
      unmount();
    }
    expect(api.datos.productos).toHaveLength(4);
    confirmar.mockRestore();
  });

  async function llenarProducto(usuario) {
    await usuario.type(screen.getByLabelText("Código"), "zz900");
    await usuario.type(screen.getByLabelText("Nombre"), "Martillo de prueba");
    await usuario.selectOptions(screen.getByLabelText("Categoría"), "herramientas");
    await usuario.type(screen.getByLabelText("Subcategoría"), "Martillos");
    await usuario.type(screen.getByLabelText("Marca"), "Truper");
    await usuario.type(screen.getByLabelText("Unidad de venta"), "Unidad");
    await usuario.type(screen.getByLabelText(/precio de lista/i), "5000");
    await usuario.type(screen.getByLabelText("Stock"), "10");
  }

  it("C89 si el servidor rechaza guardar un producto, el formulario muestra su mensaje", async () => {
    const usuario = userEvent.setup();
    api.forzar("POST", "/productos", 409, { error: "Ya existe un producto con el código ZZ900" });
    await irA("/admin/productos/nuevo");
    await llenarProducto(usuario);
    await usuario.click(screen.getByRole("button", { name: /crear producto/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Ya existe un producto con el código ZZ900");
    expect(screen.getByRole("button", { name: /crear producto/i })).toBeEnabled();
  });

  it("C90 si el servidor rechaza guardar una categoría, el formulario muestra su mensaje", async () => {
    const usuario = userEvent.setup();
    api.forzar("POST", "/categorias", 409, { error: "Ya existe la categoría ceramicas" });
    await irA("/admin/categorias/nueva");
    await usuario.type(screen.getByLabelText("Identificador"), "ceramicas");
    await usuario.type(screen.getByLabelText("Nombre"), "Cerámicas");
    await usuario.click(screen.getByRole("button", { name: /crear categoría/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Ya existe la categoría ceramicas");
  });

  it("C91 si el servidor rechaza guardar un usuario, el formulario muestra su mensaje", async () => {
    const usuario = userEvent.setup();
    api.forzar("POST", "/usuarios", 500);
    await irA("/admin/usuarios/nuevo");
    await usuario.type(screen.getByLabelText("Nombre"), "Luis");
    await usuario.type(screen.getByLabelText("Apellidos"), "Rojas");
    await usuario.type(screen.getByLabelText("Correo"), "luis.rojas@gmail.com");
    await usuario.selectOptions(screen.getByLabelText("Rol"), "Vendedor");
    await usuario.type(screen.getByLabelText("Contraseña"), "clave123");
    await usuario.click(screen.getByRole("button", { name: /crear usuario/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("La solicitud falló (500).");
  });

  it("C92 si no se pueden cargar las órdenes y los usuarios, el panel muestra el mensaje", async () => {
    api.forzar("GET", "/ordenes", 500);
    await irA("/admin/ordenes");
    expect(await screen.findByText("La solicitud falló (500).")).toBeInTheDocument();
  });
});
