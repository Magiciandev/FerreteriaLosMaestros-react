import { useState } from "react";

/*
 * Maneja el estado de un formulario controlado: valores, errores y validación.
 *
 *   const formulario = useFormulario({ correo: "", password: "" }, { correo: validarCorreo, ... });
 *   <CampoFormulario id="correo" etiqueta="Correo" {...formulario.campo("correo")} />
 *
 * Parámetros:
 *   valoresIniciales  objeto con el valor inicial de cada campo
 *   validadores       objeto { campo: (valor, todosLosValores) => "" o "mensaje de error" }
 *
 * Devuelve:
 *   datos, errores           estado actual
 *   campo(nombre)            las props de un CampoFormulario: valor, error, onChange y onBlur
 *   cambiar(nombre, valor)   cambia un campo; si ya había errores, los vuelve a revisar
 *   establecer({ ... })      cambia varios campos a la vez (por ejemplo región y comuna)
 *   validarTodo()            revisa todos los campos; devuelve true si no hay errores
 *   ponerError(nombre, msg)  muestra un error que viene de fuera (por ejemplo, correo repetido)
 *   reiniciar()              vuelve a los valores iniciales y borra los errores
 *
 * Los errores aparecen al salir de un campo (onBlur) o al enviar, y desaparecen apenas el
 * valor es válido: así no se muestra un error mientras la persona todavía está escribiendo.
 */
export function useFormulario(valoresIniciales, validadores) {
  const [datos, setDatos] = useState(valoresIniciales);
  const [errores, setErrores] = useState({});

  function revisar(campo, todos) {
    const validador = validadores[campo];
    return validador ? validador(todos[campo], todos) : "";
  }

  function establecer(cambios) {
    const siguiente = { ...datos, ...cambios };
    setDatos(siguiente);
    // Se vuelven a revisar solo los campos que ya mostraban un error (así, por ejemplo, el error
    // de "confirmar contraseña" se corrige también cuando se cambia la contraseña).
    setErrores((actual) => {
      const nuevos = { ...actual };
      for (const clave of Object.keys(actual)) {
        if (actual[clave]) nuevos[clave] = revisar(clave, siguiente);
      }
      return nuevos;
    });
  }

  function cambiar(nombre, valor) {
    establecer({ [nombre]: valor });
  }

  function salir(nombre) {
    setErrores((actual) => ({ ...actual, [nombre]: revisar(nombre, datos) }));
  }

  function validarTodo() {
    const nuevos = {};
    for (const campo of Object.keys(validadores)) nuevos[campo] = revisar(campo, datos);
    setErrores(nuevos);
    return !Object.values(nuevos).some(Boolean);
  }

  function ponerError(nombre, mensaje) {
    setErrores((actual) => ({ ...actual, [nombre]: mensaje }));
  }

  function reiniciar() {
    setDatos(valoresIniciales);
    setErrores({});
  }

  function campo(nombre) {
    return {
      valor: datos[nombre],
      error: errores[nombre],
      onChange: (evento) => cambiar(nombre, evento.target.value),
      onBlur: () => salir(nombre),
    };
  }

  return { datos, errores, campo, cambiar, establecer, validarTodo, ponerError, reiniciar };
}
