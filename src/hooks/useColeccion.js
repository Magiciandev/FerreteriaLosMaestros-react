import { useState } from "react";

/*
 * Conecta una colección de la base de datos simulada con el estado de React.
 *
 *   const productos = useColeccion(productosDB);
 *   productos.items            // arreglo actual, para mostrar en pantalla
 *   productos.crear(datos)     // guarda en la base de datos Y actualiza la pantalla
 *   productos.actualizar(id, cambios)
 *   productos.eliminar(id)
 *
 * Cada vez que se escribe en la base de datos se vuelve a leer la lista y se guarda en
 * el estado; ese cambio de estado hace que React redibuje los componentes. Así la
 * interfaz siempre refleja los datos sin recargar la página.
 */
export function useColeccion(coleccion) {
  const [items, setItems] = useState(() => coleccion.listar());

  function crear(datos) {
    const nuevo = coleccion.crear(datos); // lanza error si el id ya existe
    setItems(coleccion.listar());
    return nuevo;
  }

  function actualizar(id, cambios) {
    const actualizado = coleccion.actualizar(id, cambios);
    setItems(coleccion.listar());
    return actualizado;
  }

  function eliminar(id) {
    const eliminado = coleccion.eliminar(id);
    setItems(coleccion.listar());
    return eliminado;
  }

  return { items, crear, actualizar, eliminar };
}
