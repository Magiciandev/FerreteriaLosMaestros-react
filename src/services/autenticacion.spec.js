import { autenticar, crearSesion } from "./autenticacion";

const ana = { id: "U003", tipo: "cliente", rol: "Cliente", run: "123456785", nombre: "Ana", apellidos: "Pérez", correo: "ana@gmail.com", password: "clave1" };

describe("autenticacion", () => {
  it("[B3] autenticar devuelve el usuario con las credenciales correctas y null con una contraseña incorrecta", () => {
    expect(autenticar([ana], "ANA@gmail.com", "clave1")).toEqual(ana);
    expect(autenticar([ana], "ana@gmail.com", "Clave1")).toBeNull();
  });

  it("[B4] crearSesion guarda los datos necesarios y nunca la contraseña", () => {
    const sesion = crearSesion(ana);

    expect(sesion).toEqual({ id: "U003", nombre: "Ana", apellidos: "Pérez", correo: "ana@gmail.com", tipo: "cliente", rol: "Cliente" });
    expect(sesion).not.toHaveProperty("password");
  });
});
