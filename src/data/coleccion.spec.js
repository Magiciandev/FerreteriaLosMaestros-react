import { crearColeccion } from "./coleccion";

const semilla = [
  { id: "P001", nombre: "Uno" },
  { id: "P002", nombre: "Dos" },
];

function nuevaColeccion(opciones = {}) {
  return crearColeccion({ clave: "prueba", semilla, prefijoId: "P", ...opciones });
}

describe("crearColeccion (CRUD con localStorage)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("listar parte de los datos iniciales la primera vez y los deja guardados", () => {
    const coleccion = nuevaColeccion();

    expect(coleccion.listar()).toEqual(semilla);
    expect(JSON.parse(localStorage.getItem("prueba"))).toEqual(semilla);
  });

  it("no modifica la semilla original al crear registros", () => {
    const coleccion = nuevaColeccion();

    coleccion.crear({ nombre: "Tres" });

    expect(semilla).toHaveLength(2);
  });

  it("obtener devuelve el registro por su id y undefined si no existe", () => {
    const coleccion = nuevaColeccion();

    expect(coleccion.obtener("P002")).toEqual({ id: "P002", nombre: "Dos" });
    expect(coleccion.obtener("P999")).toBeUndefined();
  });

  it("crear genera el id siguiente al mayor existente", () => {
    const coleccion = nuevaColeccion();

    expect(coleccion.crear({ nombre: "Tres" }).id).toBe("P003");
    coleccion.eliminar("P001");
    expect(coleccion.crear({ nombre: "Cuatro" }).id).toBe("P004");
  });

  it("crear respeta el id recibido y lanza un error si ya existe", () => {
    const coleccion = nuevaColeccion();

    expect(coleccion.crear({ id: "X1", nombre: "Propio" }).id).toBe("X1");
    expect(() => coleccion.crear({ id: "X1" })).toThrow('Ya existe un registro con id "X1".');
  });

  it("crear guarda el cambio en localStorage (espía sobre setItem)", () => {
    const coleccion = nuevaColeccion();
    const espia = vi.spyOn(Storage.prototype, "setItem");

    coleccion.crear({ nombre: "Tres" });

    expect(espia).toHaveBeenCalledWith("prueba", expect.stringContaining("Tres"));
  });

  it("actualizar mezcla los cambios y no permite cambiar el id", () => {
    const coleccion = nuevaColeccion();

    const actualizado = coleccion.actualizar("P001", { nombre: "Nuevo", id: "OTRO" });

    expect(actualizado).toEqual({ id: "P001", nombre: "Nuevo" });
    expect(coleccion.obtener("P001").nombre).toBe("Nuevo");
  });

  it("actualizar devuelve null si el registro no existe", () => {
    expect(nuevaColeccion().actualizar("P999", { nombre: "x" })).toBeNull();
  });

  it("eliminar quita el registro y devuelve true; si no existe, false", () => {
    const coleccion = nuevaColeccion();

    expect(coleccion.eliminar("P001")).toBe(true);
    expect(coleccion.listar()).toHaveLength(1);
    expect(coleccion.eliminar("P001")).toBe(false);
  });

  it("si el dato guardado está dañado, vuelve a la semilla", () => {
    localStorage.setItem("prueba", "esto no es json");

    expect(nuevaColeccion().listar()).toEqual(semilla);
  });

  it("reiniciar restaura los datos iniciales", () => {
    const coleccion = nuevaColeccion();
    coleccion.crear({ nombre: "Tres" });
    coleccion.eliminar("P001");

    coleccion.reiniciar();

    expect(coleccion.listar()).toEqual(semilla);
  });

  it("usa el campo indicado como identificador", () => {
    const coleccion = crearColeccion({ clave: "cats", semilla: [{ slug: "a", label: "A" }], campoId: "slug" });

    expect(coleccion.obtener("a")).toEqual({ slug: "a", label: "A" });
    expect(coleccion.eliminar("a")).toBe(true);
  });
});
