import { crearColeccion } from "./coleccion";

// MOCK de localStorage: en vez de usar el del navegador (que guardaría datos entre pruebas y
// las haría depender unas de otras), cada prueba parte con una memoria vacía propia.
// spyOn reemplaza getItem/setItem/removeItem por funciones que leen y escriben en ese objeto.
describe("coleccion (CRUD sobre localStorage)", () => {
  let memoria;

  beforeEach(() => {
    memoria = {};
    spyOn(Storage.prototype, "getItem").and.callFake((clave) => (clave in memoria ? memoria[clave] : null));
    spyOn(Storage.prototype, "setItem").and.callFake((clave, valor) => {
      memoria[clave] = String(valor);
    });
    spyOn(Storage.prototype, "removeItem").and.callFake((clave) => {
      delete memoria[clave];
    });
  });

  const semilla = [
    { id: "U001", nombre: "Ana" },
    { id: "U002", nombre: "Luis" },
  ];

  function nuevaColeccion(opciones = {}) {
    return crearColeccion({ clave: "usuarios", semilla, prefijoId: "U", ...opciones });
  }

  describe("listar", () => {
    it("la primera vez copia la semilla y la guarda en localStorage", () => {
      const usuarios = nuevaColeccion();

      expect(usuarios.listar()).toEqual(semilla);
      expect(JSON.parse(memoria.usuarios)).toEqual(semilla);
    });

    it("si el dato guardado está dañado, vuelve a partir desde la semilla", () => {
      memoria.usuarios = "esto no es json";

      expect(nuevaColeccion().listar()).toEqual(semilla);
    });
  });

  describe("obtener", () => {
    it("devuelve el registro con ese id, o undefined si no existe", () => {
      const usuarios = nuevaColeccion();

      expect(usuarios.obtener("U002").nombre).toBe("Luis");
      expect(usuarios.obtener("U999")).toBeUndefined();
    });
  });

  describe("crear", () => {
    it("genera el siguiente id con el prefijo cuando el registro no trae uno", () => {
      const nuevo = nuevaColeccion().crear({ nombre: "Marta" });

      expect(nuevo.id).toBe("U003");
    });

    it("rellena con ceros según los dígitos configurados (ORD-0001)", () => {
      const ordenes = crearColeccion({ clave: "ordenes", semilla: [], prefijoId: "ORD-", digitos: 4 });

      expect(ordenes.crear({ total: 1000 }).id).toBe("ORD-0001");
    });

    it("el registro creado queda guardado y aparece al listar", () => {
      const usuarios = nuevaColeccion();

      usuarios.crear({ nombre: "Marta" });

      expect(usuarios.listar().length).toBe(3);
    });

    it("lanza un error si el id ya existe", () => {
      expect(() => nuevaColeccion().crear({ id: "U001", nombre: "Repetido" })).toThrowError(/Ya existe/);
    });
  });

  describe("actualizar", () => {
    it("mezcla los cambios con el registro existente", () => {
      const usuarios = nuevaColeccion();

      const actualizado = usuarios.actualizar("U001", { nombre: "Ana María" });

      expect(actualizado).toEqual({ id: "U001", nombre: "Ana María" });
      expect(usuarios.obtener("U001").nombre).toBe("Ana María");
    });

    it("no permite cambiar el id, aunque venga en los cambios", () => {
      const actualizado = nuevaColeccion().actualizar("U001", { id: "OTRO", nombre: "X" });

      expect(actualizado.id).toBe("U001");
    });

    it("devuelve null si el registro no existe", () => {
      expect(nuevaColeccion().actualizar("U999", { nombre: "X" })).toBeNull();
    });
  });

  describe("eliminar", () => {
    it("quita el registro y devuelve true", () => {
      const usuarios = nuevaColeccion();

      expect(usuarios.eliminar("U001")).toBe(true);
      expect(usuarios.obtener("U001")).toBeUndefined();
    });

    it("devuelve false si el registro no existía", () => {
      expect(nuevaColeccion().eliminar("U999")).toBe(false);
    });
  });

  describe("reiniciar", () => {
    it("descarta los cambios y vuelve a los datos de la semilla", () => {
      const usuarios = nuevaColeccion();
      usuarios.eliminar("U001");

      usuarios.reiniciar();

      expect(usuarios.listar()).toEqual(semilla);
    });
  });

  describe("campo identificador personalizado", () => {
    it("usa el campo indicado (slug) en vez de id para buscar y evitar duplicados", () => {
      const categorias = crearColeccion({
        clave: "categorias",
        semilla: [{ slug: "madera", label: "Madera y Tableros" }],
        campoId: "slug",
      });

      expect(categorias.obtener("madera").label).toBe("Madera y Tableros");
      expect(() => categorias.crear({ slug: "madera", label: "Otra" })).toThrowError(/slug/);
    });
  });
});