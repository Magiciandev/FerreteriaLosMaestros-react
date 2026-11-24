import { crearToken, instalarApi } from "../test/apiFalsa";
import { cerrarSesion, login, obtenerSesion, registrarCliente } from "./authService";

describe("services/authService", () => {
  it("C15 login guarda el token y el usuario en sessionStorage y devuelve el usuario", async () => {
    instalarApi();

    const usuario = await login("admin@profesor.duoc.cl", "Cambiar123!");

    expect(usuario).toEqual({ correo: "admin@profesor.duoc.cl", rol: "ADMIN" });
    expect(sessionStorage.getItem("token")).toMatch(/^eyJ/);
    expect(JSON.parse(sessionStorage.getItem("usuario"))).toEqual(usuario);
  });

  it("C16 login con credenciales incorrectas falla con el mensaje del servidor y no guarda nada", async () => {
    instalarApi();

    await expect(login("admin@profesor.duoc.cl", "mala")).rejects.toThrow("Credenciales inválidas");
    expect(sessionStorage.getItem("token")).toBeNull();
  });

  it("C17 obtenerSesion devuelve el usuario mientras el token está vigente y cerrarSesion lo borra", () => {
    expect(obtenerSesion()).toBeNull();
    sessionStorage.setItem("token", crearToken("ADMIN"));
    sessionStorage.setItem("usuario", JSON.stringify({ correo: "admin@profesor.duoc.cl", rol: "ADMIN" }));

    expect(obtenerSesion()).toEqual({ correo: "admin@profesor.duoc.cl", rol: "ADMIN" });
    cerrarSesion();
    expect(obtenerSesion()).toBeNull();
  });

  it("C18 obtenerSesion cierra la sesión si el token venció o está mal formado", () => {
    for (const token of [crearToken("ADMIN", "admin@profesor.duoc.cl", -10), "no-es-un-token"]) {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("usuario", JSON.stringify({ correo: "admin@profesor.duoc.cl", rol: "ADMIN" }));
      expect(obtenerSesion()).toBeNull();
      expect(sessionStorage.getItem("token")).toBeNull();
    }
  });

  it("C19 registrarCliente envía los datos al servicio de autenticación", async () => {
    const api = instalarApi();

    await registrarCliente({ correo: "nueva@gmail.com", nombre: "Marta" });

    expect(api.llamadas[0]).toMatchObject({ metodo: "POST", ruta: "/auth/registro", cuerpo: { correo: "nueva@gmail.com" } });
  });
});
