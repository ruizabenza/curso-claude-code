# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Resttek: plataforma de gestión de restaurantes. Monorepo con **npm workspaces** (`packages/*`): una API (`api`, Express 5 + TypeScript + SQLite) y tres apps Angular 21 (`web-admin` :4200, `web-empleados` :4201, `web-clientes` :4202) más la librería `web-shared`. La documentación y el código de dominio están en español. Hay documentación detallada en `docs/` (arquitectura, `dominio/modelo-datos.md`, `dominio/glosario.md`, `revisiones/inconsistencias-*.md`).

## Comandos

Desde la raíz:

```bash
npm install                 # instala todos los workspaces
npm run seed                # datos de prueba (idempotente, INSERT OR IGNORE); la contraseña de cada usuario es su email, p. ej. admin@resttek.com
npm run dev:api             # API en :3000 (tsx watch); GET /health
npm run dev:admin           # / dev:empleados / dev:clientes
npm test                    # tests de la API (vitest run)
```

Tests de la API (dentro de `packages/api`):

```bash
npm run test:watch
npx vitest run src/services/order.service.test.ts   # un fichero
npx vitest run -t "nombre del test"                 # por nombre
```

Los frontends solo tienen `start`, `build` y `watch` (`ng`); no hay script de lint ni tests de frontend configurados. Cada frontend hace proxy de `/api` a `localhost:3000` (`proxy.conf.json`); accede siempre vía el puerto del frontend.

## Arquitectura

### API (`packages/api`): dos estilos conviven

- **Hexagonal + DDD solo en `src/contexts/employee/`** (domain / application / infrastructure). `Employee` es la única entidad con comportamiento (constructor privado + `create()`); casos de uso con un único `execute()` e inyección por constructor; interfaces con prefijo `I` (`IEmployeeRepository`). `contexts/shared/` contiene el VO `Email`, `middlewares.ts` (`authenticate`, `authorize`) y `errorHandler`.
- **Por capas en `restaurant`, `dish`, `ingredient`, `order`**: carpetas transversales `models/`, `repositories/`, `services/`, `controllers/`, `routes/`. Los modelos son `interface` planas; la validación vive en los servicios y en funciones `normalizeX()` de `models/`. La interfaz del repositorio (sin prefijo `I`) está en el mismo fichero que su implementación SQLite.
- **Contrato OpenAPI**: `docs/api/openapi.yaml` (OpenAPI 3.0, escrito a mano) describe todos los endpoints; `docs/api/index.html` es la documentación generada. `npm run docs:lint` valida el contrato y `npm run docs:build` regenera el HTML. Al añadir o cambiar una ruta hay que actualizar el YAML y la lista `ROUTES` de `packages/api/src/openapi.test.ts`, y regenerar el HTML.
- Las rutas se montan en `src/app.ts` bajo `/api/v1/...` (incluye rutas `public/` sin auth y rutas anidadas `/restaurants/:restaurantId/{ingredients,dishes,employees}`).
- **Path aliases** (`@services/*`, `@employee/*`, `@shared/*`, etc., definidos en `tsconfig.json`) y los imports llevan extensión `.js` (ESM, `module: nodenext`).
- **Errores**: `AppError` → errores en `errors/DomainErrors.ts`. El `errorHandler` decide el código HTTP **por nombre de clase**: `*NotFoundError` listados → 404, `InvalidCredentialsError` → 401, resto de `AppError` → 400. Al crear un error nuevo que deba ser 404, hay que añadirlo a esa lista. Trampa conocida: `OrderNotFoundError` no está en la lista, y `OrderController` no usa `next(error)` (hace su propio try/catch), por lo que el PATCH de estado devuelve 400 donde GET devuelve 404.
- **BD**: `config/database.ts` exporta una instancia única `dbConfig`; las tablas se crean en `initialize()` (`CREATE TABLE IF NOT EXISTS`, sin sistema de migraciones). Con `NODE_ENV=test` usa `:memory:`; si no, `packages/api/resttek.db`.
- **Tests**: Vitest, unitarios junto al código, con dobles en `*/mocks/`. No hay tests HTTP (supertest está instalado pero sin uso).

### Frontends

Angular 21: standalone, signals, **zoneless**, guards/interceptors funcionales. Estructura distinta por app:
- `web-admin` y `web-empleados`: `features/<feature>/{models,pages,services,store}`; los **stores** (`providedIn: 'root'`, signals privadas expuestas como solo lectura) envuelven HTTP con `firstValueFrom`.
- `web-clientes`: modelos/servicios/store centralizados en `core/`; los componentes consumen los `Observable` con `.subscribe()`.
- No hay `shared/` propio en las apps: auth (store/servicio/guard), interceptors, login/register y estilos base viven en `@resttek/web-shared`. Tras cambiar `web-shared` hay que reiniciar el dev server del frontend.

### Auth

JWT en `localStorage`; `AuthInterceptor` añade el Bearer, `AuthGuard` protege rutas; en la API `authenticate` + `authorize(roles)`. Roles: admin, manager, camarero, cocinero, cliente.

## Otros

`scripts/seed-issues.sh` crea issues de GitHub desde `scripts/issues.json` (requiere `gh` y `jq`; ver `scripts/README.md`).
