import { fireEvent, screen } from "@testing-library/react";
import { renderConRouter } from "../test-utils";
import Header from "./Header";

const categorias = [
  { slug: "construccion", label: "Materiales de Construcción" },
  { slug: "herramientas", label: "Herramientas" },
  { slug: "gasfiteria", label: "Gasfitería" },
];
const cliente = { nombre: "Victor Navarrete", tipo: "cliente", rol: "Cliente" };
const empleado = { nombre: "Admin Sistema", tipo: "empleado", rol: "Administrador" };

// El menú de la cuenta es un desplegable: sus opciones solo existen en el DOM una vez abierto.
function abrirMenuCuenta(nombre) {
  fireEvent.click(screen.getByText(`Hola, ${nombre}`));
}

describe("Header", () => {
  describe("props", () => {
    it("muestra la cantidad del carrito recibida por props", () => {
      renderConRouter(<Header categorias={categorias} cantidadCarrito={3} />);

      expect(screen.getByText("3")).toBeTruthy();
    });
  });

  describe("menú principal", () => {
    it("incluye Productos y Ofertas, y deja Blog y Contacto para el pie de página", () => {
      renderConRouter(<Header categorias={categorias} />);

      expect(screen.getByRole("link", { name: "Productos" })).toBeTruthy();
      expect(screen.getByRole("link", { name: "Ofertas" })).toBeTruthy();
      expect(screen.queryByRole("link", { name: "Blog" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Contacto" })).toBeNull();
    });
  });

  describe("renderizado condicional según la sesión", () => {
    it("sin sesión muestra Iniciar sesión y Crear cuenta, y no el saludo", () => {
      renderConRouter(<Header categorias={categorias} sesion={null} />);

      expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeTruthy();
      expect(screen.getByRole("link", { name: "Crear cuenta" })).toBeTruthy();
      expect(screen.queryByText(/^Hola,/)).toBeNull();
    });

    it("con sesión saluda con el primer nombre y oculta Iniciar sesión", () => {
      renderConRouter(<Header categorias={categorias} sesion={cliente} />);

      expect(screen.getByText("Hola, Victor")).toBeTruthy();
      expect(screen.queryByRole("link", { name: "Iniciar sesión" })).toBeNull();
    });

    it("el enlace al panel de administración aparece solo para empleados", () => {
      renderConRouter(<Header categorias={categorias} sesion={empleado} />);
      abrirMenuCuenta("Admin");

      expect(screen.getByRole("link", { name: "Panel de administración" })).toBeTruthy();
    });

    it("un cliente ve Mi perfil pero no el panel de administración", () => {
      renderConRouter(<Header categorias={categorias} sesion={cliente} />);
      abrirMenuCuenta("Victor");

      expect(screen.getByRole("link", { name: "Mi perfil" })).toBeTruthy();
      expect(screen.queryByRole("link", { name: "Panel de administración" })).toBeNull();
    });
  });

  describe("eventos", () => {
    it("al pulsar Cerrar sesión ejecuta la función recibida por props", () => {
      const onCerrarSesion = jasmine.createSpy("onCerrarSesion");
      renderConRouter(<Header categorias={categorias} sesion={cliente} onCerrarSesion={onCerrarSesion} />);
      abrirMenuCuenta("Victor");

      fireEvent.click(screen.getByText("Cerrar sesión"));

      expect(onCerrarSesion).toHaveBeenCalledTimes(1);
    });

    it("al abrir el menú Categorías se listan todas las categorías recibidas", () => {
      const { container } = renderConRouter(<Header categorias={categorias} />);

      fireEvent.click(screen.getByText("Categorías"));

      expect(container.querySelectorAll(".dropdown-item").length).toBe(categorias.length);
      expect(screen.getByRole("link", { name: "Herramientas" }).getAttribute("href")).toBe("/categorias/herramientas");
    });
  });

  describe("estado", () => {
    it("el buscador actualiza su valor mientras el usuario escribe", () => {
      renderConRouter(<Header categorias={categorias} />);
      const buscador = screen.getByRole("searchbox");

      fireEvent.change(buscador, { target: { value: "cemento" } });

      expect(buscador.value).toBe("cemento");
    });
  });
});
