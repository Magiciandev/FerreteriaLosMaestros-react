# Ferretería Los Maestros: frontend

Tienda en línea de una ferretería (React + Vite). Este repositorio es solo el **frontend** (`ferreteria-front`): se conecta a dos servicios aparte, `ferreteria-auth` (inicio de sesión, registro y usuarios) y `ferreteria-back` (categorías, productos, órdenes y consultas). El detalle de cada ruta y de los datos que se intercambian está en el documento «Contrato de integración».

## Tecnologías

React 19, Vite, React Router 7, Bootstrap 5 con react-bootstrap, Vitest con Testing Library y ESLint.

## Cómo ejecutarlo

1. Instalar dependencias: `npm install`
2. Revisar las direcciones de los servicios en `.env.development` (hay una plantilla en `.env.example`):

   | Variable | Servicio | Valor por defecto |
   |---|---|---|
   | `VITE_AUTH_API_URL` | ferreteria-auth | `http://localhost:8082/api` |
   | `VITE_API_URL` | ferreteria-back | `http://localhost:8083/api` |

3. Levantar `ferreteria-auth` y `ferreteria-back`, y luego `npm run dev` (abre en `http://localhost:5173`).

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Genera la versión para publicar en `dist/` |
| `npm run lint` | Revisa el código con ESLint |
| `npm test` | Pruebas en modo observación |
| `npm run coverage` | Corre todas las pruebas una vez y muestra la cobertura |

## Estructura de `src/`

| Carpeta | Contenido |
|---|---|
| `components/` | Piezas reutilizables que reciben todo por props |
| `pages/` | Una página por ruta; `pages/admin/` es el panel de administración |
| `services/` | Comunicación con los servicios: `http.js` (función base con el token), `authService`, `productoService`, `categoriaService`, `ordenService`, `consultaService` y `usuarioService`; además `compras.js` y `productos.js` con reglas que reciben un servicio |
| `utils/` | Funciones puras: carrito, filtros, validaciones, estadísticas, formato |
| `data/` | Datos que se quedan en el front: blog y regiones de Chile |
| `test/` | Configuración de las pruebas, datos de prueba y el servidor simulado (`apiFalsa.js`) |
| `App.jsx` | Estado general y mapa de rutas |

En la raíz, `datos-iniciales/` tiene las categorías y los productos con los que se carga la base de datos de `ferreteria-back`.

## Sesión y roles

El inicio de sesión se hace contra `ferreteria-auth`, que entrega un token JWT con el rol del usuario. El front guarda el token y el usuario en `sessionStorage` (se borran al cerrar la pestaña) y lo envía en la cabecera `Authorization: Bearer ...`. El panel de administración (`/admin`) solo se muestra al rol `ADMIN`; sin sesión o con otro rol aparece «Acceso restringido». Los permisos reales los vuelve a revisar el servidor en cada petición. Si el token vence, la sesión se cierra sola.

## Pruebas y cobertura

`npm run coverage` mide **todo el código de `src/`** y exige 100% en sentencias, ramas, funciones y líneas. Hay 113 pruebas:

- **A1 a A10 y B1 a B10** (20 pruebas, diez por integrante): comportamiento del catálogo, el carrito y la compra.
- **C1 a C93**: cobertura de validaciones, estadísticas, servicios, todas las páginas, los flujos de compra y registro, el panel de administración y los errores del servidor.

Las pruebas de páginas no necesitan los servicios reales: usan un servidor simulado en memoria (`src/test/apiFalsa.js`) que responde como lo establece el contrato (rutas, permisos por rol y mensajes de error). Si se agrega código en `src/`, hay que agregar su prueba para mantener el 100%.

## Contrato con el backend

Resumen de lo que el front espera (todas las rutas bajo `/api`):

- **Auth:** `POST /auth/login` devuelve `{ token, correo, rol }`; `POST /auth/registro` crea un cliente; `GET/POST/PUT/DELETE /usuarios` (solo ADMIN).
- **Tienda:** `GET /categorias` y `GET /productos` son públicos; crear, cambiar y eliminar son de ADMIN. `POST /ordenes` es público (el servidor calcula precios y descuenta stock) y `GET /ordenes` es de ADMIN. `POST /consultas` es público.
- **Errores:** el servidor responde `{ "error": "mensaje" }` y el front muestra ese texto.
