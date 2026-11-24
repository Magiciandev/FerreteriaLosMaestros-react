# Fase 3: App con estado propio, capa de datos simple y sin sesión

Se aplica DESPUÉS de fase2-alcance-y-pruebas.patch. Verificado en cadena sobre el zip original:
ambos parches aplican, `vite build` compila, 20 pruebas pasan con 100% de cobertura en el alcance,
y el linter (oxlint) no entrega avisos.

    git apply --check fase3-app-datos-sin-sesion.patch
    git apply fase3-app-datos-sin-sesion.patch

## Qué cambia

- App.jsx: `useState` por lista (productos, categorías, usuarios, órdenes, consultas, carrito), cada una
  guardada con `useEffect` y `guardarJSON`; funciones crear/actualizar/eliminar escritas a mano; rutas planas
  con Header y Footer directos. El blog queda como dato fijo (no tiene CRUD).
  Las claves de localStorage son las mismas, así que los datos ya guardados siguen funcionando.
- Se eliminan: sesión, Perfil, AccesoDenegado, RutaProtegida, Layout, AdminLayout, AvisoCarrito (Toast),
  useColeccion, coleccion.js, baseDeDatos.js y services/autenticacion.js.
- Nuevos: components/PanelAdmin.jsx (menú del panel con children), utils/ids.js (siguiente id) y
  utils/usuarios.js (encontrarDuplicado, antes en autenticación).
- Header: sin menú de usuario, sin Dropdown ni buscador por URL; agrega el enlace Administración.
- Aviso del carrito: un `div.alert` con botón para cerrar (sin Toast ni temporizador).
- Productos: filtros en `useState` (ya no usa la URL).
- Login y Registro: validan y muestran un mensaje; no crean sesión. Registro sí guarda la cuenta de cliente.
- Checkout: sin datos precargados de usuario.
- Panel: sin esAdministrador ni sesion; sin "Ver cliente" en la orden y sin historial de compras en la ficha
  de usuario (las órdenes ya no guardan idUsuario; vuelve con el backend).
- compras.js: `construirOrden` sin idUsuario.

## Cosas a saber

- El panel ahora se ve dentro del Header y Footer de la tienda (antes tenía pantalla propia).
- El rol de cada usuario (Administrador, Vendedor, Cliente) sigue como DATO del usuario y del formulario;
  lo que se quitó es la sesión que lo hacía cumplir.
- Siguen pendientes (Fase 4 y 5): Checkout y formularios con `useFormulario`, `useNavigate`/`useLocation`
  en el panel, y reemplazar Table, Modal, Alert, Card y Badge de react-bootstrap por clases CSS.

## Prueba de humo opcional

humo-temporal.spec.jsx dibuja las 32 rutas y revisa el carrito y el buscador. Copiarlo a src/, correrlo
con `npx vitest run src/humo-temporal.spec.jsx` y borrarlo (no cuenta entre las 20 pruebas).
