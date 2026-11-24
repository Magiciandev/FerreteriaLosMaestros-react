import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import blog from "./data/blog.json";
import { crearToken, iniciarSesionFalsa, instalarApi } from "./test/apiFalsa";
import { productos, usuarios } from "./test/datosDePrueba";
import { irA } from "./test/irA";

// Pruebas de cobertura de la tienda contra el servidor simulado (src/test/apiFalsa.js): cada una
// recorre una página con datos conocidos y revisa lo que la aplicación le pide al servidor.
const guardado = (clave) => JSON.parse(localStorage.getItem(clave));
const sembrarCarrito = (carrito) => localStorage.setItem("carrito", JSON.stringify(carrito));

describe("Tienda", () => {
  let api;
  beforeEach(() => {
    localStorage.clear();
    api = instalarApi();
  });

  it("C33 una categoría, una entrada de blog o un producto que no existen muestran su aviso", async () => {
    for (const [ruta, aviso] of [
      ["/categorias/no-existe", /la categoría no existe/i],
      ["/blog/no-existe", /la entrada no existe/i],
      ["/productos/no-existe", /el producto no existe/i],
    ]) {
      const { unmount } = await irA(ruta);
      expect(screen.getByRole("heading", { name: aviso })).toBeInTheDocument();
      unmount();
    }
    await irA(`/blog/${blog[0].id}`);
    expect(screen.getByRole("heading", { name: blog[0].titulo })).toBeInTheDocument();
  });

  it("C34 el detalle de un producto sin stock avisa y no deja agregarlo", async () => {
    await irA("/productos/HE011");
    expect(screen.getByText(/no tiene stock por ahora/i)).toBeInTheDocument();
    expect(screen.getByText("Sin stock")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /agregar al carrito/i })).toBeNull();
  });

  it("C35 el detalle de un producto con pocas unidades valida la cantidad antes de agregar", async () => {
    const usuario = userEvent.setup();
    await irA("/productos/HE010");
    expect(screen.getByText("Últimas unidades")).toBeInTheDocument();
    const cantidad = screen.getByLabelText("Cantidad");
    await usuario.clear(cantidad);
    await usuario.type(cantidad, "99");
    expect(screen.getByText(/ingresa una cantidad entre 1 y 4/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /agregar al carrito/i })).toBeDisabled();
    await usuario.clear(cantidad);
    await usuario.type(cantidad, "2");
    await usuario.click(screen.getByRole("button", { name: /agregar al carrito/i }));
    expect(guardado("carrito")).toEqual([{ idProducto: "HE010", cantidad: 2 }]);
  });

  it("C36 el carrito permite cambiar cantidades, quitar productos y vaciarse, y avisa si ajustó al stock", async () => {
    const usuario = userEvent.setup();
    sembrarCarrito([{ idProducto: "MC001", cantidad: 2 }, { idProducto: "HE010", cantidad: 9 }]);
    await irA("/carrito");
    expect(screen.getByText(/ajustamos algunas cantidades/i)).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: /aumentar cantidad de cemento/i }));
    expect(guardado("carrito")[0]).toEqual({ idProducto: "MC001", cantidad: 3 });
    await usuario.click(screen.getByRole("button", { name: /quitar taladro/i }));
    expect(guardado("carrito")).toHaveLength(1);
    await usuario.click(screen.getByRole("button", { name: /vaciar carrito/i }));
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
  });

  it("C37 el aviso de producto agregado se puede cerrar", async () => {
    const usuario = userEvent.setup();
    await irA("/productos");
    await usuario.click(screen.getAllByRole("button", { name: /agregar/i })[0]);
    expect(screen.getByRole("alert")).toHaveTextContent(/se agregó al carrito/i);
    await usuario.click(screen.getByRole("button", { name: /cerrar aviso/i }));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });

  it("C38 el aviso del carrito se desvanece solo con el tiempo", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      await irA("/productos");
      await usuario.click(screen.getAllByRole("button", { name: /agregar/i })[0]);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    } finally {
      vi.useRealTimers();
    }
  });

  it("C39 al agregar otro producto con el aviso visible, el aviso muestra el último", async () => {
    const usuario = userEvent.setup();
    await irA("/productos");
    const agregar = screen.getAllByRole("button", { name: /agregar/i });
    await usuario.click(agregar[0]);
    await usuario.click(agregar[1]);
    expect(screen.getByRole("alert")).toHaveTextContent(new RegExp(productos[1].nombre, "i"));
    expect(guardado("carrito")).toHaveLength(2);
  });

  async function escribirConsulta(usuario) {
    await usuario.type(screen.getByLabelText("Nombre"), "Ana");
    await usuario.type(screen.getByLabelText("Correo"), "ana@gmail.com");
    await usuario.type(screen.getByLabelText("Mensaje"), "Necesito cotizar cemento para una obra.");
    await usuario.click(screen.getByRole("button", { name: /enviar mensaje/i }));
  }

  it("C40 una consulta de contacto válida se envía al servidor", async () => {
    const usuario = userEvent.setup();
    await irA("/contacto");
    await escribirConsulta(usuario);
    expect(await screen.findByRole("status")).toHaveTextContent(/gracias por escribirnos/i);
    expect(api.datos.consultas[0]).toMatchObject({ id: "C001", nombre: "Ana", correo: "ana@gmail.com" });
  });

  it("C41 si el servidor rechaza la consulta, el formulario muestra el mensaje", async () => {
    const usuario = userEvent.setup();
    api.forzar("POST", "/consultas", 500);
    await irA("/contacto");
    await escribirConsulta(usuario);
    expect(await screen.findByRole("alert")).toHaveTextContent("La solicitud falló (500).");
  });

  it("C42 el inicio de sesión exige un correo y una contraseña", async () => {
    const usuario = userEvent.setup();
    await irA("/login");
    await usuario.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    expect(screen.getByText(/escribe un correo válido/i)).toBeInTheDocument();
    expect(screen.getByText(/escribe tu contraseña/i)).toBeInTheDocument();
    expect(api.llamadas.some((llamada) => llamada.ruta === "/auth/login")).toBe(false);
  });

  async function iniciarSesion(usuario, correo, password) {
    await usuario.type(screen.getByLabelText("Correo"), correo);
    await usuario.type(screen.getByLabelText("Contraseña"), password);
    await usuario.click(screen.getByRole("button", { name: /iniciar sesión/i }));
  }

  it("C43 el administrador inicia sesión, entra directo al panel y puede cerrar sesión", async () => {
    const usuario = userEvent.setup();
    await irA("/login");
    expect(screen.queryByRole("link", { name: "Administración" })).toBeNull();
    await iniciarSesion(usuario, "admin@profesor.duoc.cl", "Cambiar123!");
    expect(await screen.findByRole("navigation", { name: /menú de administración/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Administración" })).toBeInTheDocument();
    expect(sessionStorage.getItem("token")).toMatch(/^eyJ/);
    await usuario.click(screen.getByRole("button", { name: /cerrar sesión/i }));
    expect(screen.queryByRole("link", { name: "Administración" })).toBeNull();
    expect(screen.getByRole("link", { name: "Ingresar" })).toBeInTheDocument();
    expect(sessionStorage.getItem("token")).toBeNull();
  });

  it("C44 otra cuenta (vendedor) ingresa al inicio, sin enlace al panel", async () => {
    const usuario = userEvent.setup();
    await irA("/login");
    await iniciarSesion(usuario, "vendedor@duoc.cl", "Cambiar123!");
    expect(await screen.findByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /iniciar sesión/i })).toBeNull();
    expect(screen.queryByRole("link", { name: "Administración" })).toBeNull();
  });

  it("C45 con credenciales incorrectas el login muestra el mensaje del servidor y no inicia sesión", async () => {
    const usuario = userEvent.setup();
    await irA("/login");
    await iniciarSesion(usuario, "admin@profesor.duoc.cl", "mala-clave");
    expect(await screen.findByRole("alert")).toHaveTextContent("Credenciales inválidas");
    expect(sessionStorage.getItem("token")).toBeNull();
  });

  it("C46 sin sesión, con un token vencido o con un rol sin permiso el panel muestra el acceso restringido", async () => {
    const casos = [
      () => {},
      () => {
        sessionStorage.setItem("token", crearToken("ADMIN", "admin@profesor.duoc.cl", -10));
        sessionStorage.setItem("usuario", JSON.stringify({ correo: "admin@profesor.duoc.cl", rol: "ADMIN" }));
      },
      () => iniciarSesionFalsa("VENDEDOR", "vendedor@duoc.cl"),
    ];
    for (const prepararSesion of casos) {
      sessionStorage.clear();
      prepararSesion();
      const { unmount } = await irA("/admin/productos");
      expect(screen.getByRole("heading", { name: /acceso restringido/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /iniciar sesión/i })).toBeInTheDocument();
      unmount();
    }
  });

  it("C47 el menú Categorías del encabezado lleva directo a una categoría", async () => {
    const usuario = userEvent.setup();
    await irA("/contacto");
    await usuario.click(screen.getByRole("button", { name: "Categorías" }));
    await usuario.click(screen.getByRole("link", { name: "Herramientas" }));
    expect(screen.getByRole("heading", { name: /herramientas/i })).toBeInTheDocument();
  });

  async function llenarRegistro(usuario, correo) {
    await usuario.type(screen.getByLabelText("RUN"), "12345678-5");
    await usuario.type(screen.getByLabelText("Nombre"), "Ana");
    await usuario.type(screen.getByLabelText("Apellidos"), "Pérez");
    await usuario.type(screen.getByLabelText("Correo"), correo);
    await usuario.click(screen.getByLabelText("Particular"));
    await usuario.selectOptions(screen.getByLabelText("Región"), "Metropolitana de Santiago");
    await usuario.selectOptions(screen.getByLabelText("Comuna"), "Santiago");
    await usuario.type(screen.getByLabelText("Dirección"), "Av. Siempre Viva 123");
    await usuario.type(screen.getByLabelText("Contraseña"), "clave123");
    await usuario.type(screen.getByLabelText("Confirmar contraseña"), "clave123");
    await usuario.click(screen.getByRole("button", { name: /crear cuenta/i }));
  }

  it("C48 el registro muestra el mensaje del servidor cuando el correo ya tiene una cuenta", async () => {
    const usuario = userEvent.setup();
    await irA("/registro");
    await llenarRegistro(usuario, usuarios[0].correo);
    expect(await screen.findByRole("alert")).toHaveTextContent(/ya existe una cuenta con el correo/i);
    expect(api.datos.usuarios).toHaveLength(usuarios.length);
  });

  it("C49 el registro con campos vacíos muestra los errores y no llama al servidor", async () => {
    const usuario = userEvent.setup();
    await irA("/registro");
    await usuario.click(screen.getByRole("button", { name: /crear cuenta/i }));
    expect(screen.getByText(/selecciona si eres particular o contratista/i)).toBeInTheDocument();
    expect(screen.getByText(/revisa los campos marcados/i)).toBeInTheDocument();
    expect(api.llamadas.some((llamada) => llamada.ruta === "/auth/registro")).toBe(false);
  });

  it("C50 una compra con despacho a domicilio muestra la dirección en la boleta y permite enviarla o imprimirla", async () => {
    const usuario = userEvent.setup();
    window.print = vi.fn();
    sembrarCarrito([{ idProducto: "MC001", cantidad: 1 }]);
    await irA("/checkout");
    await usuario.type(screen.getByLabelText("Nombre"), "Ana");
    await usuario.type(screen.getByLabelText("Apellidos"), "Pérez");
    await usuario.type(screen.getByLabelText("Correo"), "ana@gmail.com");
    await usuario.type(screen.getByLabelText("Calle y número"), "Av. Siempre Viva 123");
    await usuario.type(screen.getByLabelText("Departamento (opcional)"), "12B");
    await usuario.selectOptions(screen.getByLabelText("Región"), "Metropolitana de Santiago");
    await usuario.selectOptions(screen.getByLabelText("Comuna"), "Santiago");
    await usuario.type(screen.getByLabelText(/indicaciones para la entrega/i), "Portón negro");
    await usuario.click(screen.getByRole("button", { name: /pagar ahora/i }));
    expect(await screen.findByRole("heading", { name: /se ha realizado la compra/i })).toBeInTheDocument();
    expect(screen.getByText(/depto\. 12B/i)).toBeInTheDocument();
    expect(screen.getByText(/portón negro/i)).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: /enviar boleta por correo/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/ana@gmail.com/);
    await usuario.click(screen.getByRole("button", { name: /imprimir boleta/i }));
    expect(window.print).toHaveBeenCalled();
  });

  async function llenarCheckout(usuario) {
    await usuario.type(screen.getByLabelText("Nombre"), "Ana");
    await usuario.type(screen.getByLabelText("Apellidos"), "Pérez");
    await usuario.type(screen.getByLabelText("Correo"), "ana@gmail.com");
    await usuario.click(screen.getByLabelText(/retiro en tienda/i));
  }

  it("C51 si al pagar ya no hay stock, el checkout muestra el mensaje del servidor y conserva el carrito", async () => {
    const usuario = userEvent.setup();
    sembrarCarrito([{ idProducto: "HE010", cantidad: 3 }]);
    await irA("/checkout");
    api.datos.productos.find((producto) => producto.id === "HE010").stock = 1;
    await llenarCheckout(usuario);
    await usuario.click(screen.getByRole("button", { name: /pagar ahora/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Stock insuficiente de Taladro percutor 650 W: quedan 1");
    expect(guardado("carrito")).toHaveLength(1);
    expect(api.datos.ordenes).toHaveLength(3);
  });

  it("C52 si se pierde la conexión al pagar, el checkout avisa y permite reintentar", async () => {
    const usuario = userEvent.setup();
    sembrarCarrito([{ idProducto: "MC001", cantidad: 1 }]);
    await irA("/checkout");
    await llenarCheckout(usuario);
    api.caida = true;
    await usuario.click(screen.getByRole("button", { name: /pagar ahora/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/no se pudo conectar con el servidor/i);
    expect(screen.getByRole("button", { name: /pagar ahora/i })).toBeEnabled();
  });

  it("C53 el catálogo se puede filtrar por texto, categoría y ofertas, y limpiar", async () => {
    const usuario = userEvent.setup();
    await irA("/productos");
    await usuario.selectOptions(screen.getByLabelText(/categoría/i), "herramientas");
    expect(screen.getByText("2 productos")).toBeInTheDocument();
    await usuario.click(screen.getByLabelText(/solo ofertas/i));
    expect(screen.getByText("2 productos")).toBeInTheDocument();
    await usuario.type(screen.getByLabelText(/buscar en el catálogo/i), "taladro");
    fireEvent.submit(screen.getByRole("form", { name: /filtros de productos/i }));
    expect(screen.getByText("1 producto")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: /limpiar filtros/i }));
    expect(screen.getByText("4 productos")).toBeInTheDocument();
  });

  it("C54 la lista de categorías cuenta los productos en singular y plural", async () => {
    api = instalarApi({ productos: [productos[0], productos[1], productos[3]] });
    await irA("/categorias");
    expect(screen.getByText("2 productos")).toBeInTheDocument();
    expect(screen.getByText("1 producto")).toBeInTheDocument();
  });

  it("C55 si el carrito guardado en el navegador está dañado, la tienda arranca con el carrito vacío", async () => {
    localStorage.setItem("carrito", "{esto no es json");
    await irA("/carrito");
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
  });

  it("C56 si el servidor no responde, la tienda muestra el mensaje de error en lugar de las páginas", async () => {
    api.caida = true;
    await irA("/productos");
    expect(screen.getByRole("alert")).toHaveTextContent(/no se pudo conectar con el servidor/i);
    expect(screen.queryByRole("heading", { name: "Productos" })).toBeNull();
  });

  it("C57 las fotos de los productos se muestran con su ruta, y sin foto aparece el marcador", async () => {
    api = instalarApi({
      productos: [
        { ...productos[0], imagen: "assets/img/productos/cemento.jpg" },
        { ...productos[1], imagen: "/assets/img/productos/taladro.jpg" },
        productos[3],
      ],
    });
    await irA("/productos");
    expect(screen.getByAltText(productos[0].nombre)).toHaveAttribute("src", "/assets/img/productos/cemento.jpg");
    expect(screen.getByAltText(productos[1].nombre)).toHaveAttribute("src", "/assets/img/productos/taladro.jpg");
    expect(screen.getByRole("img", { name: /sin imagen disponible/i })).toBeInTheDocument();
  });
});
