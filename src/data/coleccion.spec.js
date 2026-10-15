import { crearColeccion } from "./coleccion";

const semilla = [
  { id: "P001", nombre: "Uno" },
  { id: "P002", nombre: "Dos" },
];

describe("crearColeccion (CRUD con localStorage)", () => {
  let coleccion;

  beforeEach(() => {
    localStorage.clear();
    coleccion = crearColeccion({ clave: "prueba", semilla, prefijoId: "P" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ESPÍA: vi.spyOn envuelve setItem sin reemplazarlo: la prueba puede ver con qué se llamó.
  it("[A9] crear guarda el nuevo registro en localStorage (espía sobre setItem)", () => {
    const espia = vi.spyOn(Storage.prototype, "setItem");

    coleccion.crear({ nombre: "Tres" });

    expect(espia).toHaveBeenCalledWith("prueba", expect.stringContaining("Tres"));
  });

  it("[A10] crear con un id que ya existe lanza un error y no agrega nada", () => {
    expect(() => coleccion.crear({ id: "P001", nombre: "Repetido" })).toThrow('Ya existe un registro con id "P001".');
    expect(coleccion.listar()).toHaveLength(2);
  });
});
