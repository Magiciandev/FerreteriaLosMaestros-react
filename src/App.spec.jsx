// Pruebas de la aplicación completa (App con sus rutas) contra un servidor simulado
// (src/test/apiFalsa.js): recorrido de todas las páginas y los flujos principales de la tienda y
// del panel. Son pruebas de cobertura, además de las 20 pruebas de comportamiento (A1 a A10 y
// B1 a B10) de los archivos de utils, services y components.
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import blog from "./data/blog.json";
import { iniciarSesionFalsa, instalarApi } from "./test/apiFalsa";
import { categorias, productos, usuarios } from "./test/datosDePrueba";
import { irA } from "./test/irA";

const rutas = [
  "/", "/productos", `/productos/${productos[0].id}`, "/categorias", `/categorias/${categorias[0].slug}`, "/ofertas",
  "/nosotros", "/blog", `/blog/${blog[0].id}`, "/contacto", "/login", "/registro", "/carrito", "/checkout",
  "/admin", "/admin/ordenes", "/admin/productos", "/admin/productos/nuevo",
  "/admin/productos/criticos", `/admin/productos/${productos[0].id}`, `/admin/productos/${productos[0].id}/editar`,
  "/admin/categorias", "/admin/categorias/nueva", `/admin/categorias/${categorias[0].slug}/editar`,
  "/admin/usuarios", "/admin/usuarios/nuevo", `/admin/usuarios/${usuarios[0].id}`, `/admin/usuarios/${usuarios[0].id}/editar`,
  "/admin/reportes", "/ruta-que-no-existe",
];

describe("App", () => {
  let api;
  beforeEach(() => {
    localStorage.clear();
    api = instalarApi();
    iniciarSesionFalsa("ADMIN");
  });

  it("C20 todas las rutas de la tienda y del panel se dibujan sin errores", async () => {
    const errores = vi.spyOn(console, "error").mockImplementation(() => {});
    for (const ruta of rutas) {
      const { unmount } = await irA(ruta);
      expect(document.querySelector("main")).not.toBeNull();
      expect(screen.getAllByText("Ferretería Los Maestros").length).toBeGreaterThan(0);
      unmount();
    }
    expect(errores).not.toHaveBeenCalled();
    errores.mockRestore();
  });

  it("C21 agregar al carrito muestra el aviso y guarda el carrito", async () => {
    const usuario = userEvent.setup();
    await irA("/productos");
    await usuario.click(screen.getAllByRole("button", { name: /agregar/i })[0]);
    expect(screen.getByRole("alert")).toHaveTextContent(/se agregó al carrito/i);
    expect(JSON.parse(localStorage.getItem("carrito"))).toHaveLength(1);
  });

  it("C22 el buscador del catálogo filtra por texto", async () => {
    const usuario = userEvent.setup();
    await irA("/productos");
    await usuario.type(screen.getByLabelText(/buscar en el catálogo/i), "zzzz-no-existe");
    expect(screen.getByText("0 productos")).toBeInTheDocument();
  });

  async function llegarAlCheckout(usuario) {
    await irA("/productos");
    await usuario.click(screen.getAllByRole("button", { name: /agregar/i })[0]);
    await usuario.click(screen.getByRole("link", { name: /ver carrito/i }));
    await usuario.click(screen.getByRole("link", { name: /continuar con la compra/i }));
    await usuario.type(screen.getByLabelText("Nombre"), "Ana");
    await usuario.type(screen.getByLabelText("Apellidos"), "Pérez");
    await usuario.type(screen.getByLabelText("Correo"), "ana@gmail.com");
    await usuario.click(screen.getByLabelText(/retiro en tienda/i));
  }

  it("C23 compra aprobada: muestra la boleta del servidor, descuenta stock y vacía el carrito", async () => {
    const usuario = userEvent.setup();
    await llegarAlCheckout(usuario);
    await usuario.click(screen.getByRole("button", { name: /pagar ahora/i }));
    expect(await screen.findByRole("heading", { name: /se ha realizado la compra. n.° ORD-0004/i })).toBeInTheDocument();
    expect(api.datos.ordenes.at(-1)).toMatchObject({ id: "ORD-0004", estado: "pagada", total: 5990 });
    expect(api.llamadas.find((llamada) => llamada.ruta === "/ordenes" && llamada.metodo === "POST").cuerpo.items).toEqual([{ idProducto: "MC001", cantidad: 1 }]);
    expect(JSON.parse(localStorage.getItem("carrito"))).toEqual([]);
    expect(api.datos.productos.find((producto) => producto.id === "MC001").stock).toBe(79);
  });

  it("C24 pago rechazado: registra el intento, conserva el carrito y permite reintentar con los datos", async () => {
    const usuario = userEvent.setup();
    await llegarAlCheckout(usuario);
    await usuario.selectOptions(screen.getByLabelText(/resultado del pago/i), "rechazado");
    await usuario.click(screen.getByRole("button", { name: /pagar ahora/i }));
    expect(await screen.findByRole("heading", { name: /no se pudo realizar el pago/i })).toBeInTheDocument();
    expect(api.datos.ordenes.at(-1)).toMatchObject({ estado: "rechazada" });
    expect(JSON.parse(localStorage.getItem("carrito"))).toHaveLength(1);
    await usuario.click(screen.getByRole("button", { name: /volver a realizar el pago/i }));
    expect(screen.getByLabelText("Nombre")).toHaveValue("Ana");
  });

  it("C25 checkout con datos inválidos muestra errores y no registra la orden", async () => {
    const usuario = userEvent.setup();
    await irA("/productos");
    await usuario.click(screen.getAllByRole("button", { name: /agregar/i })[0]);
    await usuario.click(screen.getByRole("link", { name: /ver carrito/i }));
    await usuario.click(screen.getByRole("link", { name: /continuar con la compra/i }));
    await usuario.click(screen.getByRole("button", { name: /pagar ahora/i }));
    expect(screen.getAllByText(/obligatorio|inválido|requerid/i).length).toBeGreaterThan(0);
    expect(api.datos.ordenes).toHaveLength(3);
  });

  it("C26 registro válido crea la cuenta de cliente en el servidor y muestra el mensaje", async () => {
    const usuario = userEvent.setup();
    await irA("/registro");
    await usuario.type(screen.getByLabelText("RUN"), "11111111-1");
    await usuario.type(screen.getByLabelText("Nombre"), "Ana");
    await usuario.type(screen.getByLabelText("Apellidos"), "Pérez");
    await usuario.type(screen.getByLabelText("Correo"), "ana.nueva@gmail.com");
    await usuario.click(screen.getByLabelText("Particular"));
    await usuario.selectOptions(screen.getByLabelText("Región"), "Metropolitana de Santiago");
    await usuario.selectOptions(screen.getByLabelText("Comuna"), "Santiago");
    await usuario.type(screen.getByLabelText("Dirección"), "Av. Siempre Viva 123");
    await usuario.type(screen.getByLabelText("Contraseña"), "clave123");
    await usuario.type(screen.getByLabelText("Confirmar contraseña"), "clave123");
    await usuario.click(screen.getByRole("button", { name: /crear cuenta/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(/cuenta creada/i);
    expect(api.datos.usuarios.at(-1)).toMatchObject({ correo: "ana.nueva@gmail.com", rol: "CLIENTE", id: 3, fechaNacimiento: null });
    expect(api.llamadas.find((llamada) => llamada.ruta === "/auth/registro").cuerpo).not.toHaveProperty("confirmar");
  });

  // ---------- Panel de administración ----------

  it("C27 panel: crear producto, y no permite repetir el código", async () => {
    const usuario = userEvent.setup();
    await irA("/admin/productos/nuevo");
    const llenar = async () => {
      await usuario.clear(screen.getByLabelText("Código"));
      await usuario.type(screen.getByLabelText("Código"), "zz900");
      await usuario.clear(screen.getByLabelText("Nombre"));
      await usuario.type(screen.getByLabelText("Nombre"), "Martillo de prueba");
      await usuario.selectOptions(screen.getByLabelText("Categoría"), categorias[0].slug);
      await usuario.clear(screen.getByLabelText("Subcategoría"));
      await usuario.type(screen.getByLabelText("Subcategoría"), "Martillos");
      await usuario.clear(screen.getByLabelText("Marca"));
      await usuario.type(screen.getByLabelText("Marca"), "Truper");
      await usuario.clear(screen.getByLabelText("Unidad de venta"));
      await usuario.type(screen.getByLabelText("Unidad de venta"), "Unidad");
      await usuario.clear(screen.getByLabelText(/precio de lista/i));
      await usuario.type(screen.getByLabelText(/precio de lista/i), "5000");
      await usuario.clear(screen.getByLabelText("Stock"));
      await usuario.type(screen.getByLabelText("Stock"), "10");
    };
    await llenar();
    await usuario.click(screen.getByRole("button", { name: /crear producto/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(/se creó/i);
    expect(api.datos.productos.some((p) => p.id === "ZZ900" && p.precio === 5000)).toBe(true);
    // el formulario queda vacío y volver a usar el mismo código da error
    await llenar();
    await usuario.click(screen.getByRole("button", { name: /crear producto/i }));
    expect(screen.getByText(/ya existe un producto con ese código/i)).toBeInTheDocument();
  });

  it("C28 panel: editar producto guarda los cambios en el servidor y muestra el mensaje", async () => {
    const usuario = userEvent.setup();
    await irA(`/admin/productos/${productos[0].id}/editar`);
    await usuario.clear(screen.getByLabelText("Nombre"));
    await usuario.type(screen.getByLabelText("Nombre"), "Nombre editado");
    await usuario.click(screen.getByRole("button", { name: /guardar cambios/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(/se actualizó/i);
    expect(api.datos.productos.find((p) => p.id === productos[0].id)).toMatchObject({ nombre: "Nombre editado", stock: 80 });
  });

  it("C29 panel: eliminar producto pide confirmación y respeta la respuesta", async () => {
    const usuario = userEvent.setup();
    await irA("/admin/productos");
    const confirmar = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    await usuario.click(screen.getAllByRole("button", { name: /eliminar/i })[0]);
    expect(api.datos.productos).toHaveLength(productos.length);
    await usuario.click(screen.getAllByRole("button", { name: /eliminar/i })[0]);
    expect(await screen.findByText(/se eliminó/i)).toBeInTheDocument();
    expect(api.datos.productos).toHaveLength(productos.length - 1);
    confirmar.mockRestore();
  });

  it("C30 panel: crear categoría y rechazar un identificador repetido", async () => {
    const usuario = userEvent.setup();
    await irA("/admin/categorias/nueva");
    await usuario.type(screen.getByLabelText("Identificador"), "ceramicas");
    await usuario.type(screen.getByLabelText("Nombre"), "Cerámicas");
    await usuario.click(screen.getByRole("button", { name: /crear categoría/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(/se creó/i);
    expect(api.datos.categorias.some((c) => c.slug === "ceramicas")).toBe(true);
    await usuario.type(screen.getByLabelText("Identificador"), "ceramicas");
    await usuario.type(screen.getByLabelText("Nombre"), "Otra");
    await usuario.click(screen.getByRole("button", { name: /crear categoría/i }));
    expect(screen.getByText(/ya existe una categoría/i)).toBeInTheDocument();
  });

  it("C31 panel: eliminar categoría con confirmación", async () => {
    const usuario = userEvent.setup();
    api = instalarApi({ categorias: [...categorias, { slug: "sin-uso", label: "Sin uso" }] });
    await irA("/admin/categorias");
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(true);
    await usuario.click(screen.getByRole("button", { name: /eliminar sin uso/i }));
    expect(await screen.findByText(/se eliminó/i)).toBeInTheDocument();
    expect(api.datos.categorias.some((c) => c.slug === "sin-uso")).toBe(false);
    confirmar.mockRestore();
  });

  it("C32 panel: crear usuario del personal y exigir los datos", async () => {
    const usuario = userEvent.setup();
    await irA("/admin/usuarios/nuevo");
    await usuario.type(screen.getByLabelText("Nombre"), "Luis");
    await usuario.type(screen.getByLabelText("Apellidos"), "Rojas");
    await usuario.type(screen.getByLabelText("Correo"), "luis.rojas@gmail.com");
    await usuario.selectOptions(screen.getByLabelText("Rol"), "Vendedor");
    await usuario.type(screen.getByLabelText("Contraseña"), "clave123");
    await usuario.click(screen.getByRole("button", { name: /crear usuario/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(/se creó/i);
    expect(api.datos.usuarios.at(-1)).toMatchObject({ id: 3, rol: "VENDEDOR", tipoCliente: null, region: null });
    // formulario con datos vacíos muestra errores
    await usuario.click(screen.getByRole("button", { name: /crear usuario/i }));
    expect(screen.getByText(/revisa los campos marcados/i)).toBeInTheDocument();
  });
});
