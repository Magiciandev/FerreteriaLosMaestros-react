import { crearColeccion } from "./coleccion";
import blogSemilla from "./blog.json";
import categoriasSemilla from "./categorias.json";
import productosSemilla from "./productos.json";
import usuariosSemilla from "./usuarios.json";

/*
 * BASE DE DATOS SIMULADA
 * Cada colección ofrece listar / obtener / crear / actualizar / eliminar / reiniciar
 * (ver coleccion.js) y se persiste en localStorage. Los .json de esta carpeta son solo
 * los datos iniciales.
 *
 * DICCIONARIO DE DATOS
 *
 * productosDB   id (código, único) · nombre · categoria (slug de categoriasDB) · subcategoria
 *               marca · unidad · precio (CLP) · descuento (% entero, 0 = sin oferta)
 *               stock · stockMinimo (umbral de stock crítico) · imagen (ruta o null)
 *               descripcion (opcional)
 *
 * categoriasDB  slug (único, es el id) · label
 *
 * usuariosDB    id · tipo ("empleado" | "cliente") · rol ("Administrador" | "Vendedor" | "Cliente")
 *               run · nombre · apellidos · correo (único) · password (texto plano, solo por ser
 *               simulación sin backend; ver RNF-06) · fechaNacimiento · tipoCliente
 *               ("particular" | "contratista") · region · comuna · direccion
 *
 * ordenesDB     id (ORD-0001...) · fecha (ISO) · estado ("pagada" | "rechazada")
 *               cliente { nombre, apellidos, correo } · entrega { calle, depto, region, comuna,
 *               indicaciones, despacho } · items [{ idProducto, nombre, precioUnitario,
 *               cantidad, subtotal }] · total · idUsuario (si compró con sesión, si no null)
 *
 * blogDB        id · titulo · resumen · autor · fecha · contenido (arreglo de párrafos)
 *
 * consultasDB   id · nombre · correo · mensaje · fecha   (mensajes del formulario de contacto)
 */
export const productosDB = crearColeccion({ clave: "productos", semilla: productosSemilla });
export const categoriasDB = crearColeccion({ clave: "categorias", semilla: categoriasSemilla, campoId: "slug" });
export const usuariosDB = crearColeccion({ clave: "usuarios", semilla: usuariosSemilla, prefijoId: "U" });
export const ordenesDB = crearColeccion({ clave: "ordenes", semilla: [], prefijoId: "ORD-", digitos: 4 });
export const blogDB = crearColeccion({ clave: "blog", semilla: blogSemilla, prefijoId: "B" });
export const consultasDB = crearColeccion({ clave: "consultas", semilla: [], prefijoId: "C" });

// Restaura todas las colecciones a sus datos iniciales.
export function reiniciarBaseDeDatos() {
  [productosDB, categoriasDB, usuariosDB, ordenesDB, blogDB, consultasDB].forEach((coleccion) =>
    coleccion.reiniciar()
  );
}
