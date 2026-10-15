# Ferretería Los Maestros (React)

Evaluación Parcial 2 - Desarrollo FullStack II (DSY1104). Migración de la tienda de la
Fase 1 (HTML + CSS + JS) a React + Bootstrap, con pruebas unitarias en Vitest.

## Cómo ejecutarlo

```bash
npm install
npm run dev          # tienda en http://localhost:5173
npm run build        # compila a /dist
npm run lint         # revisión estática con oxlint
```

## Pruebas (Vitest + Testing Library)

```bash
npm test             # modo vigilancia: se re-ejecuta al guardar
npm run test:run     # una sola ejecución (deben pasar las 20)
npm run coverage     # pruebas + informe de cobertura en coverage/index.html
```

El proyecto tiene **exactamente 20 pruebas, 10 por integrante**, y no se agregan más: si algo nuevo
necesita una prueba, reemplaza a una de estas. Cada prueba empieza con su código.
La configuración está en el bloque `test` de `vite.config.js` y en `src/test/setup.js`.

| Código | Qué comprueba                                                       | Archivo                                   |
| ------ | ------------------------------------------------------------------- | ----------------------------------------- |
| A1     | `precioFinal` aplica el descuento                                   | `src/utils/productos.spec.js`             |
| A2     | Agregar al carrito sube el contador y guarda en `localStorage`      | `src/App.spec.jsx`                        |
| A3     | `TarjetaProducto` muestra los datos recibidos por props             | `src/components/TarjetaProducto.spec.jsx` |
| A4     | Un producto en oferta muestra descuento y precio tachado            | `src/components/TarjetaProducto.spec.jsx` |
| A5     | Con stock 0 el botón de agregar se deshabilita                      | `src/components/TarjetaProducto.spec.jsx` |
| A6     | El clic en Agregar llama a `onAgregar`                              | `src/components/TarjetaProducto.spec.jsx` |
| A7     | `GrillaProductos` dibuja una tarjeta por producto                   | `src/components/GrillaProductos.spec.jsx` |
| A8     | Escribir en el buscador cambia los resultados                       | `src/pages/Productos.spec.jsx`            |
| A9     | `crear` guarda en `localStorage` (espía)                            | `src/data/coleccion.spec.js`              |
| A10    | `crear` con un id repetido lanza un error                           | `src/data/coleccion.spec.js`              |
| B1     | `validarRun` acepta y rechaza según el dígito verificador           | `src/utils/validaciones.spec.js`          |
| B2     | Productos críticos con un servicio simulado (mock asíncrono)        | `src/services/productos.spec.js`          |
| B3     | `autenticar` con credenciales correctas e incorrectas               | `src/services/autenticacion.spec.js`      |
| B4     | `crearSesion` nunca incluye la contraseña                           | `src/services/autenticacion.spec.js`      |
| B5     | Con sesión, el `Header` saluda con el primer nombre                 | `src/components/Header.spec.jsx`          |
| B6     | Cerrar sesión ejecuta la función recibida por props                 | `src/components/Header.spec.jsx`          |
| B7     | `CampoFormulario` muestra el error solo cuando existe               | `src/components/CampoFormulario.spec.jsx` |
| B8     | `useFormulario` muestra el error al salir del campo, no al escribir | `src/hooks/useFormulario.spec.jsx`        |
| B9     | `Login` llama a `onIngresar` con el correo y la contraseña          | `src/pages/Login.spec.jsx`                |
| B10    | `RutaProtegida` con un rol no permitido muestra Acceso restringido  | `src/components/RutaProtegida.spec.jsx`   |

## Estructura

```
src/
  components/   piezas reutilizables (Header, TarjetaProducto, CampoFormulario, ...)
  layouts/      estructuras con <Outlet />: Layout (tienda) y AdminLayout (panel)
  pages/        una vista por ruta
  data/         base de datos simulada
    baseDeDatos.js   colecciones y diccionario de datos
    coleccion.js     fábrica de CRUD (listar, obtener, crear, actualizar, eliminar)
    *.json           datos iniciales; regiones.js: regiones y comunas
  hooks/        useColeccion: conecta una colección con el estado de React
  services/     lógica que recibe el servicio como parámetro (se prueba con mocks)
  utils/        funciones puras: formato, localStorage, validaciones, productos, carrito
  test/         configuración y datos de apoyo para las pruebas
  App.jsx       estado global (sesión, carrito, colecciones) y tabla de rutas
```

## Base de datos simulada

Cada colección (productos, categorías, usuarios, órdenes, blog, consultas) se guarda en
`localStorage` y expone las operaciones CRUD. La primera vez se copia el `.json` inicial.
Para volver a los datos de fábrica, desde la consola del navegador: `localStorage.clear()`
y recargar.

## Estado de las fases

- [x] Fase 1: esqueleto, rutas y navbar responsive
- [x] Fase 2: base de datos simulada con CRUD, validaciones y helpers
- [x] Fase 3: tienda pública (inicio, productos con filtros, detalle, categorías, ofertas, nosotros, blog, contacto) y entorno de pruebas con Vitest
- [x] Fase 4: cuenta y sesión (login, registro, perfil y rutas protegidas por rol)
- [x] Fase 5: compra (carrito, checkout, pago aprobado y rechazado simulado, boleta)
- [ ] Fase 6: administración
- [ ] Cierre: cobertura analizada, ERS V2, documento de cobertura y entrega

## Convención de commits (un integrante por funcionalidad)

`feat:` funcionalidad nueva - `test:` pruebas - `fix:` corrección - `docs:` documentación
Ejemplo: `feat(tienda): catálogo con búsqueda y filtros`
