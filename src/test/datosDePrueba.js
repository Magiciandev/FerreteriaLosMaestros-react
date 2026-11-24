// Datos pequeños y fijos para las pruebas de páginas, así no dependen del catálogo real.
export const categorias = [
  { slug: "construccion", label: "Materiales de Construcción" },
  { slug: "herramientas", label: "Herramientas" },
];

export const productos = [
  { id: "MC001", nombre: "Cemento Polpaico gris 25 kg", categoria: "construccion", subcategoria: "Cementos", marca: "Polpaico", unidad: "Saco", precio: 5990, descuento: 0, stock: 80, stockMinimo: 20, imagen: null },
  { id: "HE010", nombre: "Taladro percutor 650 W", categoria: "herramientas", subcategoria: "Taladros", marca: "Bosch", unidad: "Unidad", precio: 49990, descuento: 20, stock: 4, stockMinimo: 5, imagen: null },
  { id: "HE011", nombre: "Martillo carpintero 16 oz", categoria: "herramientas", subcategoria: "Martillos", marca: "Stanley", unidad: "Unidad", precio: 8990, descuento: 10, stock: 0, stockMinimo: 3, imagen: null },
  { id: "MC004", nombre: "Mortero nivelador piso 25 kg", categoria: "construccion", subcategoria: "Morteros", marca: "Weber", unidad: "Saco", precio: 6490, descuento: 0, stock: 30, stockMinimo: 10, imagen: null },
];

export const entradasBlog = [
  { id: "B001", titulo: "Cómo elegir el cemento adecuado", resumen: "Qué mirar antes de comprar.", autor: "Equipo Los Maestros", fecha: "2026-09-12", contenido: ["Primer párrafo.", "Segundo párrafo."] },
  { id: "B002", titulo: "Herramientas básicas", resumen: "Un set mínimo para el hogar.", autor: "Equipo Los Maestros", fecha: "2026-09-26", contenido: ["Único párrafo."] },
];

// Usuarios tal como los entrega el servidor (sin contraseña, con el rol en mayúsculas).
export const usuarios = [
  { id: 1, rol: "ADMIN", run: null, nombre: "Rosa", apellidos: "Admin", correo: "admin@profesor.duoc.cl", fechaNacimiento: null, tipoCliente: null, region: null, comuna: null, direccion: null },
  { id: 2, rol: "CLIENTE", run: "12345678-5", nombre: "Luis", apellidos: "Rojas", correo: "luis@gmail.com", fechaNacimiento: "1990-05-10", tipoCliente: "particular", region: "Metropolitana de Santiago", comuna: "Santiago", direccion: "Calle 1" },
];

const clienteAna = { nombre: "Ana", apellidos: "Pérez", correo: "ana@gmail.com" };
const entregaDomicilio = { tipo: "domicilio", calle: "Av. Siempre Viva 123", departamento: "12B", region: "Metropolitana de Santiago", comuna: "Santiago", indicaciones: "Portón negro" };
const entregaRetiro = { tipo: "retiro", calle: "", departamento: "", region: "", comuna: "", indicaciones: "" };
const item = (idProducto, nombre, precioUnitario, cantidad) => ({ idProducto, nombre, precioUnitario, cantidad, subtotal: precioUnitario * cantidad });

// Órdenes tal como las entrega el servidor: dos pagadas y una rechazada.
export const ordenes = [
  { id: "ORD-0001", fecha: "2026-10-02T10:00:00Z", estado: "pagada", cliente: clienteAna, entrega: entregaDomicilio, items: [item("MC001", "Cemento Polpaico gris 25 kg", 5990, 2), item("HE010", "Taladro percutor 650 W", 39992, 1)], total: 51972 },
  { id: "ORD-0002", fecha: "2026-10-03T10:00:00Z", estado: "pagada", cliente: clienteAna, entrega: entregaRetiro, items: [item("MC001", "Cemento Polpaico gris 25 kg", 5990, 1)], total: 5990 },
  { id: "ORD-0003", fecha: "2026-10-01T09:00:00Z", estado: "rechazada", cliente: clienteAna, entrega: entregaRetiro, items: [item("HE011", "Martillo carpintero 16 oz", 8091, 1)], total: 8091 },
];
