import { ErrorApi, solicitar } from "./http";

const BASE = "http://api.test/api";
const respuesta = (estado, cuerpo) => ({ status: estado, ok: estado < 400, json: async () => cuerpo ?? Promise.reject(new Error("sin cuerpo")) });

describe("services/http", () => {
  it("C11 solicitar envía el token de la sesión y el cuerpo en JSON, y devuelve la respuesta", async () => {
    sessionStorage.setItem("token", "abc.def.ghi");
    const falso = vi.fn().mockResolvedValue(respuesta(200, { id: 1 }));
    vi.stubGlobal("fetch", falso);

    const datos = await solicitar(BASE, "/productos", { method: "POST", body: "{}" });

    expect(datos).toEqual({ id: 1 });
    expect(falso).toHaveBeenCalledWith(`${BASE}/productos`, {
      method: "POST",
      body: "{}",
      headers: { "Content-Type": "application/json", Authorization: "Bearer abc.def.ghi" },
    });
  });

  it("C12 solicitar no envía Authorization sin sesión y devuelve null en una eliminación (204)", async () => {
    const falso = vi.fn().mockResolvedValue(respuesta(204));
    vi.stubGlobal("fetch", falso);

    expect(await solicitar(BASE, "/productos/MC001", { method: "DELETE" })).toBeNull();
    expect(falso.mock.calls[0][1].headers).toEqual({ "Content-Type": "application/json" });
  });

  it("C13 solicitar convierte los errores del servidor en un ErrorApi con el mensaje del servidor o uno por defecto", async () => {
    const casos = [
      [respuesta(409, { error: "Ya existe un producto" }), "Ya existe un producto"],
      [respuesta(401, { mensaje: "Credenciales inválidas" }), "Credenciales inválidas"],
      [respuesta(403), /no tienes permiso/i],
      [respuesta(500), "La solicitud falló (500)."],
    ];
    for (const [simulada, esperado] of casos) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(simulada));
      const fallo = await solicitar(BASE, "/x").catch((error) => error);
      expect(fallo).toBeInstanceOf(ErrorApi);
      expect(fallo.estado).toBe(simulada.status);
      expect(fallo.message).toMatch(esperado);
    }
  });

  it("C14 solicitar avisa con un mensaje claro cuando no hay conexión con el servidor", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const fallo = await solicitar(BASE, "/productos").catch((error) => error);

    expect(fallo.estado).toBe(0);
    expect(fallo.message).toMatch(/no se pudo conectar/i);
  });
});
