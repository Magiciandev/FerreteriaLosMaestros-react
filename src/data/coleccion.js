import { guardarJSON, leerJSON } from "../utils/almacenamiento";

/*
 * crearColeccion arma las cinco operaciones CRUD para UNA colección de datos
 * (productos, usuarios, órdenes...). Es una "fábrica": una función que recibe la
 * configuración y devuelve un objeto con las funciones listas para usar.
 *
 *   const productos = crearColeccion({ clave: "productos", semilla: [...] });
 *   productos.listar();                       // Leer todos
 *   productos.obtener("MC001");               // Leer uno
 *   productos.crear({ id: "X1", ... });       // Crear
 *   productos.actualizar("X1", { precio: 1 });// Actualizar
 *   productos.eliminar("X1");                 // Eliminar
 *
 * Opciones:
 *   clave     nombre bajo el que se guarda en localStorage
 *   semilla   datos iniciales; se copian la primera vez que se usa la colección
 *   campoId   campo que identifica a cada registro (por defecto "id")
 *   prefijoId prefijo para los ids que se generan solos (ej. "ORD-")
 *   digitos   largo del número del id generado (ej. 4 -> ORD-0001)
 *
 * La fuente de verdad es localStorage: cada operación lee, modifica y vuelve a guardar,
 * así los datos sobreviven a recargar la página.
 */
export function crearColeccion({ clave, semilla = [], campoId = "id", prefijoId = "", digitos = 3 }) {
  function leer() {
    const guardado = leerJSON(clave, null);
    if (Array.isArray(guardado)) return guardado;
    // Primera vez (o dato dañado): se parte desde la semilla.
    const inicial = structuredClone(semilla);
    guardarJSON(clave, inicial);
    return inicial;
  }

  // Siguiente id disponible: PREFIJO + (mayor número existente + 1).
  function generarId(items) {
    const numeros = items
      .map((item) => String(item[campoId]))
      .filter((id) => id.startsWith(prefijoId))
      .map((id) => parseInt(id.slice(prefijoId.length), 10))
      .filter((numero) => !Number.isNaN(numero));
    const siguiente = (numeros.length ? Math.max(...numeros) : 0) + 1;
    return `${prefijoId}${String(siguiente).padStart(digitos, "0")}`;
  }

  return {
    // READ: todos los registros.
    listar() {
      return leer();
    },

    // READ: un registro por su id (undefined si no existe).
    obtener(id) {
      return leer().find((item) => item[campoId] === id);
    },

    // CREATE: agrega un registro. Si no trae id se genera uno; si el id ya existe, lanza error.
    crear(datos) {
      const items = leer();
      const id = datos[campoId] ?? generarId(items);
      if (items.some((item) => item[campoId] === id)) {
        throw new Error(`Ya existe un registro con ${campoId} "${id}".`);
      }
      const nuevo = { ...datos, [campoId]: id };
      guardarJSON(clave, [...items, nuevo]);
      return nuevo;
    },

    // UPDATE: mezcla los cambios sobre el registro. El id no se puede modificar.
    // Devuelve el registro actualizado, o null si no existe.
    actualizar(id, cambios) {
      const items = leer();
      const posicion = items.findIndex((item) => item[campoId] === id);
      if (posicion === -1) return null;
      const actualizado = { ...items[posicion], ...cambios, [campoId]: id };
      guardarJSON(clave, items.map((item, i) => (i === posicion ? actualizado : item)));
      return actualizado;
    },

    // DELETE: quita el registro. Devuelve true si existía, false si no.
    eliminar(id) {
      const items = leer();
      const quedan = items.filter((item) => item[campoId] !== id);
      if (quedan.length === items.length) return false;
      guardarJSON(clave, quedan);
      return true;
    },

    // Vuelve a los datos semilla (útil para demostraciones y para empezar de cero).
    reiniciar() {
      const inicial = structuredClone(semilla);
      guardarJSON(clave, inicial);
      return inicial;
    },
  };
}
