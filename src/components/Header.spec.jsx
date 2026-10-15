import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { renderConRouter } from "../test/renderConRouter";
import Header from "./Header";

const categorias = [
  { slug: "construccion", label: "Materiales de Construcción" },
  { slug: "herramientas", label: "Herramientas" },
  { slug: "gasfiteria", label: "Gasfitería" },
];
const cliente = { nombre: "Victor Navarrete", tipo: "cliente", rol: "Cliente" };
const empleado = { nombre: "Admin Sistema", tipo: "empleado", rol: "Administrador" };

// Muestra la dirección actual, para comprobar a dónde navega el buscador.
function UbicacionActual() {
  const { pathname, search } = useLocation();
  return <p>Ubicación: {pathname}{search}</p>;
}

describe("Header", () => {
  describe("props", () => {
    it("muestra la cantidad del carrito recibida por props", () => {
      renderConRouter(<Header categorias={categorias} cantidadCarrito={3} />);

      expect(screen.getByRole("link", { name: "Carrito 3" })).toBeInTheDocument();
    });
  });

  describe("menú principal", () => {
    it("incluye Productos y Ofertas, y deja Blog y Contacto para el pie de página", () => {
      renderConRouter(<Header categorias={categorias} />);

      expect(screen.getByRole("link", { name: "Productos" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Ofertas" })).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Blog" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Contacto" })).not.toBeInTheDocument();
    });

    it("al abrir Categorías lista todas las categorías recibidas", async () => {
      const usuario = userEvent.setup();
      renderConRouter(<Header categorias={categorias} />);

      await usuario.click(screen.getByText("Categorías"));

      expect(screen.getByRole("link", { name: "Herramientas" })).toHaveAttribute("href", "/categorias/herramientas");
      expect(screen.getAllByRole("link").filter((enlace) => enlace.className.includes("dropdown-item"))).toHaveLength(3);
    });
  });

  describe("acceso sin sesión", () => {
    it("muestra un solo botón Ingresar con las opciones ocultas", () => {
      renderConRouter(<Header categorias={categorias} sesion={null} />);

      expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
      expect(screen.queryByText("Iniciar sesión")).not.toBeInTheDocument();
      expect(screen.queryByText("Crear cuenta")).not.toBeInTheDocument();
    });

    it("al pulsar Ingresar despliega Iniciar sesión y Crear cuenta", async () => {
      const usuario = userEvent.setup();
      renderConRouter(<Header categorias={categorias} sesion={null} />);

      await usuario.click(screen.getByRole("button", { name: "Ingresar" }));

      expect(screen.getByText("Iniciar sesión")).toHaveAttribute("href", "/login");
      expect(screen.getByText("Crear cuenta")).toHaveAttribute("href", "/registro");
    });
  });

  describe("acceso con sesión", () => {
    it("saluda con el primer nombre y reemplaza al botón Ingresar", () => {
      renderConRouter(<Header categorias={categorias} sesion={cliente} />);

      expect(screen.getByRole("button", { name: "Hola, Victor" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Ingresar" })).not.toBeInTheDocument();
    });

    it("un cliente ve Mi perfil pero no el panel de administración", async () => {
      const usuario = userEvent.setup();
      renderConRouter(<Header categorias={categorias} sesion={cliente} />);

      await usuario.click(screen.getByRole("button", { name: "Hola, Victor" }));

      expect(screen.getByRole("link", { name: "Mi perfil" })).toBeInTheDocument();
      expect(screen.queryByText("Panel de administración")).not.toBeInTheDocument();
    });

    it("un empleado ve el enlace al panel de administración", async () => {
      const usuario = userEvent.setup();
      renderConRouter(<Header categorias={categorias} sesion={empleado} />);

      await usuario.click(screen.getByRole("button", { name: "Hola, Admin" }));

      expect(screen.getByText("Panel de administración")).toHaveAttribute("href", "/admin");
    });

    it("al pulsar Cerrar sesión ejecuta la función recibida por props", async () => {
      const usuario = userEvent.setup();
      const onCerrarSesion = vi.fn();
      renderConRouter(<Header categorias={categorias} sesion={cliente} onCerrarSesion={onCerrarSesion} />);

      await usuario.click(screen.getByRole("button", { name: "Hola, Victor" }));
      await usuario.click(screen.getByText("Cerrar sesión"));

      expect(onCerrarSesion).toHaveBeenCalledTimes(1);
    });
  });

  describe("buscador", () => {
    it("actualiza su valor mientras el usuario escribe", async () => {
      const usuario = userEvent.setup();
      renderConRouter(<Header categorias={categorias} />);
      const buscador = screen.getByRole("searchbox", { name: "Buscar productos" });

      await usuario.type(buscador, "cemento");

      expect(buscador).toHaveValue("cemento");
    });

    it("al enviar navega a /productos con el texto en la dirección", async () => {
      const usuario = userEvent.setup();
      render(
        <MemoryRouter>
          <Header categorias={categorias} />
          <Routes>
            <Route path="/productos" element={<UbicacionActual />} />
            <Route path="*" element={null} />
          </Routes>
        </MemoryRouter>
      );

      await usuario.type(screen.getByRole("searchbox", { name: "Buscar productos" }), "taladro percutor{Enter}");

      expect(screen.getByText("Ubicación: /productos?q=taladro%20percutor")).toBeInTheDocument();
    });
  });
});
