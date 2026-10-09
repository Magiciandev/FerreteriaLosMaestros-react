# Ferretería Los Maestros (React)

Evaluación Parcial 2 - Desarrollo FullStack II (DSY1104). Migración de la tienda de la
Fase 1 (HTML + CSS + JS) a React + Bootstrap.

## Cómo ejecutarlo

```bash
npm install
npm run dev          # tienda en http://localhost:5173
npm run build        # compila a /dist
npm run lint         # revisión estática con oxlint
```

## Estructura

```
src/
  components/   piezas reutilizables (Header, Footer, ...)
  layouts/      estructuras con <Outlet />: Layout (tienda) y AdminLayout (panel)
  pages/        una vista por ruta
  data/         base de datos simulada
    baseDeDatos.js   colecciones y diccionario de datos
    coleccion.js     fábrica de CRUD (listar, obtener, crear, actualizar, eliminar)
    *.json           datos iniciales; regiones.js: regiones y comunas
  hooks/        useColeccion: conecta una colección con el estado de React
  utils/        funciones puras: formato CLP, localStorage, validaciones, helpers de producto
  App.jsx       estado global (sesión, carrito, colecciones) y tabla de rutas
```

## Base de datos simulada

Cada colección (productos, categorías, usuarios, órdenes, blog, consultas) se guarda en
`localStorage` y expone las operaciones CRUD. La primera vez se copia el `.json` inicial.
Para volver a los datos de fábrica, desde la consola del navegador: `localStorage.clear()`
y recargar.

Cambios respecto a los datos de la Fase 1: los productos ya no guardan `categoriaLabel`
(el nombre se obtiene de la categoría) y tienen un campo `descuento` (12 productos en
oferta); los usuarios son un solo arreglo con `tipo` y `rol`.

## Estado de las fases

- [x] Fase 1: esqueleto, rutas y navbar responsive
- [x] Fase 2: base de datos simulada con CRUD, validaciones y helpers
- [ ] Fase 3: tienda - Fase 4: cuenta - Fase 5: compra - Fase 6: administración
- [ ] Pruebas unitarias: por definir según el ejemplo visto en clases
- [ ] Cierre: ERS V2, documento de cobertura y entrega

## Convención de commits (un integrante por funcionalidad)

`feat:` funcionalidad nueva - `test:` pruebas - `fix:` corrección - `docs:` documentación
Ejemplo: `feat(datos): colección de productos con CRUD`
