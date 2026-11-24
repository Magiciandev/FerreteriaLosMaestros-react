// Servidor simulado para las pruebas: reemplaza a fetch y responde como lo hacen ferreteria-auth y
// ferreteria-back según el contrato (rutas, permisos por rol y mensajes de error). Guarda sus
// datos en memoria (api.datos) para poder revisar lo que la aplicación creó, cambió o borró.
import { categorias, ordenes, productos, usuarios } from "./datosDePrueba";

const AUTH = import.meta.env.VITE_AUTH_API_URL;
const API = import.meta.env.VITE_API_URL;

// Un token con la forma de un JWT: encabezado.payload.firma. Solo importa el payload (rol y vencimiento).
export function crearToken(rol, correo = "admin@profesor.duoc.cl", segundos = 3600) {
  const payload = btoa(JSON.stringify({ sub: correo, rol, exp: Math.floor(Date.now() / 1000) + segundos }));
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.firma`;
}

// Deja una sesión iniciada, como si la persona ya hubiera ingresado.
export function iniciarSesionFalsa(rol = "ADMIN", correo = "admin@profesor.duoc.cl") {
  sessionStorage.setItem("token", crearToken(rol, correo));
  sessionStorage.setItem("usuario", JSON.stringify({ correo, rol }));
}

const respuesta = (estado, cuerpo = null) => ({
  status: estado,
  ok: estado >= 200 && estado < 300,
  json: async () => {
    if (cuerpo === null) throw new Error("La respuesta no tiene cuerpo");
    return cuerpo;
  },
});

const maximo = (lista, extraer) => Math.max(0, ...lista.map(extraer));

export function crearApiFalsa(inicial = {}) {
  const datos = {
    productos: structuredClone(inicial.productos ?? productos),
    categorias: structuredClone(inicial.categorias ?? categorias),
    usuarios: structuredClone(inicial.usuarios ?? usuarios),
    ordenes: structuredClone(inicial.ordenes ?? ordenes),
    consultas: [],
    cuentas: [
      { correo: "admin@profesor.duoc.cl", password: "Cambiar123!", rol: "ADMIN" },
      { correo: "vendedor@duoc.cl", password: "Cambiar123!", rol: "VENDEDOR" },
    ],
  };
  const forzadas = [];
  const api = {
    datos,
    llamadas: [],
    caida: false,
    // Hace que la próxima llamada a esa ruta responda con el estado y el cuerpo indicados.
    forzar(metodo, ruta, estado, cuerpo = null) {
      forzadas.push({ metodo, ruta, estado, cuerpo });
    },
  };

  function rolDelToken(cabecera) {
    if (!cabecera) return null;
    const payload = JSON.parse(atob(cabecera.replace("Bearer ", "").split(".")[1]));
    return payload.rol;
  }

  // Devuelve la respuesta de error si la persona no puede hacer esto, o null si puede.
  const exigirAdmin = (rol) => {
    if (!rol) return respuesta(401);
    return rol === "ADMIN" ? null : respuesta(403, { error: "Acceso denegado" });
  };

  function crearOrden(cuerpo) {
    const items = [];
    for (const { idProducto, cantidad } of cuerpo.items) {
      const producto = datos.productos.find((actual) => actual.id === idProducto);
      if (!producto) return respuesta(404, { error: `Producto no encontrado: ${idProducto}` });
      if (cuerpo.pagoAprobado && producto.stock < cantidad) {
        return respuesta(409, { error: `Stock insuficiente de ${producto.nombre}: quedan ${producto.stock}` });
      }
      const precioUnitario = Math.round(producto.precio * (1 - producto.descuento / 100));
      items.push({ idProducto, nombre: producto.nombre, precioUnitario, cantidad, subtotal: precioUnitario * cantidad });
    }
    if (cuerpo.pagoAprobado) {
      for (const { idProducto, cantidad } of cuerpo.items) {
        datos.productos.find((actual) => actual.id === idProducto).stock -= cantidad;
      }
    }
    const numero = maximo(datos.ordenes, (orden) => Number(orden.id.slice(4))) + 1;
    const orden = {
      id: `ORD-${String(numero).padStart(4, "0")}`,
      fecha: new Date().toISOString(),
      estado: cuerpo.pagoAprobado ? "pagada" : "rechazada",
      cliente: cuerpo.cliente,
      entrega: cuerpo.entrega,
      items,
      total: items.reduce((suma, linea) => suma + linea.subtotal, 0),
    };
    datos.ordenes.push(orden);
    return respuesta(201, orden);
  }

  // Crea, cambia o borra en una lista según el método. "clave" es el campo que identifica a cada elemento.
  function recurso(lista, clave, nombre, metodo, id, cuerpo, rol) {
    const denegado = exigirAdmin(rol);
    if (metodo === "POST") {
      if (denegado) return denegado;
      if (lista.some((actual) => String(actual[clave]).toLowerCase() === String(cuerpo[clave]).toLowerCase())) {
        return respuesta(409, { error: `Ya existe ${nombre} ${cuerpo[clave]}` });
      }
      const nuevo = clave === "id" && typeof lista[0]?.id === "number" ? { ...cuerpo, id: maximo(lista, (x) => x.id) + 1 } : cuerpo;
      delete nuevo.password;
      lista.push(nuevo);
      return respuesta(201, nuevo);
    }
    const indice = lista.findIndex((actual) => String(actual[clave]) === id);
    if (denegado) return denegado;
    if (indice === -1) return respuesta(404, { error: `No encontrado: ${id}` });
    if (metodo === "PUT") {
      lista[indice] = { ...lista[indice], ...cuerpo, [clave]: lista[indice][clave] };
      delete lista[indice].password;
      return respuesta(200, lista[indice]);
    }
    if (nombre === "la categoría" && datos.productos.some((producto) => producto.categoria === id)) {
      return respuesta(409, { error: "No se puede eliminar: hay productos en esa categoría" });
    }
    lista.splice(indice, 1);
    return respuesta(204);
  }

  api.fetch = async (url, opciones = {}) => {
    if (api.caida) throw new TypeError("Failed to fetch");
    const metodo = opciones.method ?? "GET";
    const base = url.startsWith(AUTH) ? AUTH : API;
    const ruta = url.slice(base.length);
    const cuerpo = opciones.body ? JSON.parse(opciones.body) : null;
    const rol = rolDelToken(opciones.headers?.Authorization);
    api.llamadas.push({ metodo, ruta, cuerpo });

    const indiceForzada = forzadas.findIndex((forzada) => forzada.metodo === metodo && forzada.ruta === ruta);
    if (indiceForzada !== -1) {
      const { estado, cuerpo: cuerpoForzado } = forzadas.splice(indiceForzada, 1)[0];
      return respuesta(estado, cuerpoForzado);
    }

    const [, coleccion, id] = ruta.split("/");

    if (base === AUTH) {
      if (ruta === "/auth/login") {
        const cuenta = datos.cuentas.find((actual) => actual.correo === cuerpo.correo && actual.password === cuerpo.password);
        if (!cuenta) return respuesta(401, { error: "Credenciales inválidas" });
        return respuesta(200, { token: crearToken(cuenta.rol, cuenta.correo), correo: cuenta.correo, rol: cuenta.rol });
      }
      if (ruta === "/auth/registro") {
        const repetido = datos.usuarios.some((actual) => actual.correo === cuerpo.correo || (cuerpo.run && actual.run === cuerpo.run));
        if (repetido) return respuesta(409, { error: `Ya existe una cuenta con el correo ${cuerpo.correo}` });
        const nuevo = { ...cuerpo, rol: "CLIENTE", id: maximo(datos.usuarios, (x) => x.id) + 1 };
        delete nuevo.password;
        datos.usuarios.push(nuevo);
        return respuesta(201, nuevo);
      }
      if (coleccion === "usuarios") {
        if (metodo === "GET") return exigirAdmin(rol) ?? respuesta(200, datos.usuarios);
        const correoRepetido = datos.usuarios.some((actual) => actual.correo === cuerpo?.correo && String(actual.id) !== id);
        if ((metodo === "POST" || metodo === "PUT") && correoRepetido) {
          return exigirAdmin(rol) ?? respuesta(409, { error: `Ya existe una cuenta con el correo ${cuerpo.correo}` });
        }
        return recurso(datos.usuarios, "id", "un usuario con el correo", metodo, id, cuerpo, rol);
      }
      return respuesta(404, { error: "Ruta desconocida" });
    }

    if (coleccion === "categorias") {
      if (metodo === "GET") return respuesta(200, datos.categorias);
      return recurso(datos.categorias, "slug", "la categoría", metodo, id, cuerpo, rol);
    }
    if (coleccion === "productos") {
      if (metodo === "GET") return respuesta(200, datos.productos);
      return recurso(datos.productos, "id", "un producto con el código", metodo, id, cuerpo, rol);
    }
    if (coleccion === "ordenes") {
      if (metodo === "POST") return crearOrden(cuerpo);
      return exigirAdmin(rol) ?? respuesta(200, datos.ordenes);
    }
    if (coleccion === "consultas" && metodo === "POST") {
      const consulta = { ...cuerpo, id: `C${String(datos.consultas.length + 1).padStart(3, "0")}`, fecha: new Date().toISOString() };
      datos.consultas.push(consulta);
      return respuesta(201, consulta);
    }
    return respuesta(404, { error: "Ruta desconocida" });
  };

  return api;
}

// Crea el servidor simulado y lo instala como fetch (setup.js lo restituye después de cada prueba).
export function instalarApi(inicial) {
  const api = crearApiFalsa(inicial);
  vi.stubGlobal("fetch", api.fetch);
  return api;
}
