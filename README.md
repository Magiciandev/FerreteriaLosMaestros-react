# Ferretería Los Maestros (React)

Evaluación Parcial 2 · Desarrollo FullStack II (DSY1104). Migración de la tienda de la
Fase 1 (HTML + CSS + JS) a React + Bootstrap, con pruebas unitarias en Jasmine y Karma.

## Cómo ejecutarlo

```bash
npm install
npm run dev          # tienda en http://localhost:5173
npm run build        # compila a /dist
npm run lint         # revisión estática con oxlint
```

## Pruebas (Jasmine + Karma)

```bash
npm test             # Karma + Chrome sin ventana (requiere Chrome instalado) + cobertura
npm run test:watch   # Chrome con ventana, se re-ejecuta al guardar
npm run test:jsdom   # sin Chrome: usa jsdom (DOM simulado en Node)
```

El reporte de cobertura queda en `coverage/html/index.html`.
Las pruebas viven junto al código que prueban: `Header.jsx` -> `Header.spec.jsx`.

## Estructura

```
src/
  components/   piezas reutilizables (Header, Footer, ...) y sus *.spec.jsx
  layouts/      estructuras con <Outlet />: Layout (tienda) y AdminLayout (panel)
  pages/        una vista por ruta (se llena desde la Fase 3)
  data/         datos semilla de la Fase 1 (productos, categorías, usuarios)
  utils/        funciones puras: formato CLP, lectura/escritura en localStorage
  App.jsx       estado global (sesión, carrito) y tabla de rutas
karma.conf.cjs  configuración del entorno de pruebas
```

## Estado de las fases

- [x] Fase 1: esqueleto, rutas, navbar responsive, entorno Karma + Jasmine (17 pruebas)
- [ ] Fase 2: archivo de datos con CRUD + persistencia
- [ ] Fase 3: tienda · Fase 4: cuenta · Fase 5: compra · Fase 6: administración
- [ ] Fase 7: suite final de pruebas · Fase 8: ERS V2, cobertura y entrega

## Convención de commits (un integrante por funcionalidad)

`feat:` funcionalidad nueva · `test:` pruebas · `fix:` corrección · `docs:` documentación
Ejemplo: `feat(header): navbar con buscador y menú de categorías`
