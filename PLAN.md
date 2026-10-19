# Plan: Especificación OpenAPI 3 de la API de Resttek y documentación HTML

**Tipo:** feature

## Objetivo

Describir todos los endpoints de la API (`/api/v1/...` y `/health`) en un contrato OpenAPI 3.0 (YAML) que sea la fuente única de verdad. A partir de él se genera un HTML estático de documentación.

## Alcance

- **Incluye:** `docs/api/openapi.yaml` con los 29 endpoints actuales, esquemas de modelos y enums, esquema de seguridad `bearerAuth` con roles por endpoint, respuestas de error `{error, message}`, script npm que genera `docs/api/index.html` con Redocly CLI, test que valida el YAML y mención en `CLAUDE.md`.
- **No incluye:** cambiar el comportamiento de la API; corregir `OrderNotFoundError` (400 en vez de 404, se documenta tal cual); servir la documentación desde Express; generar clientes.
- **Capas afectadas:** ninguna de código de producción (solo `docs/`, `package.json` raíz y un test en `packages/api`).

## Tareas

Cada tarea debe durar entre 5 y 10 minutos.

- [x] 1. Leer controladores y servicios; anotar bodies, query params y códigos de respuesta (~10 min)
- [x] 2. Crear `docs/api/openapi.yaml` con `info`, `servers`, `tags`, `bearerAuth` y componentes comunes de error (~8 min)
- [x] 3. Esquemas `Restaurant`, `Ingredient`, `Dish` (+ `DishIngredient`) y sus entradas create/update (~10 min)
- [x] 4. Esquemas `Order`, `OrderItem`, creación de pedido, `Employee`, login y register (~10 min)
- [x] 5. Paths de `auth` y `/health` (~7 min)
- [x] 6. Paths de `employees` y `restaurants/{restaurantId}/employees` (~8 min)
- [x] 7. Paths de `restaurants` y `public/restaurants` (~8 min)
- [x] 8. Paths de `ingredients` (~8 min)
- [x] 9. Paths de `dishes` y `public/restaurants/{restaurantId}/dishes` (~10 min)
- [x] 10. Paths de `orders`, documentando el 400 del PATCH con pedido inexistente (~10 min)
- [x] 11. Añadir `@redocly/cli` y scripts `docs:lint` y `docs:build` (~5 min)
- [x] 12. Ejecutar `npm run docs:lint` y corregir errores (~10 min)
- [x] 13. Test de contrato `packages/api/src/openapi.test.ts` (~10 min)
- [ ] 14. Ejecutar `npm run docs:build` y comprobar el HTML (~5 min)
- [ ] 15. Documentar en `CLAUDE.md` y `docs/arquitectura/arquitectura-api.md` (~5 min)

**Tiempo total estimado:** 124 min

## Criterios de aceptación

- [ ] `docs/api/openapi.yaml` existe y `npm run docs:lint` termina sin errores.
- [ ] El contrato describe los 29 endpoints de `src/app.ts`; públicos y `/auth/*` sin seguridad, el resto con `bearerAuth` y roles.
- [ ] Cada operación incluye la respuesta de éxito y las de error aplicables (400, 401, 403, 404) con formato `{error, message}`.
- [ ] `npm run docs:build` genera `docs/api/index.html` con todos los endpoints agrupados por tag.
- [ ] `PATCH /orders/{orderId}/items/{itemId}/status` con pedido inexistente devuelve 400 en el contrato, igual que la API real.
- [ ] El test de contrato falla si falta en el YAML alguna ruta de la lista y pasa si coinciden.
- [ ] `npm test` (Vitest, equivalente de `pytest` aquí) pasa sin fallos.
- [ ] Se mantienen las reglas de `CLAUDE.md`: no se modifica código de producción y los nombres de dominio quedan en español.

## Riesgos y notas

- La plantilla del skill menciona `pytest`; aquí se usa `npm test` (Vitest).
- Los bodies se deducen leyendo controladores (no hay esquemas formales).
- El YAML se escribe a mano; el test de contrato mitiga la desincronización.
- Redocly es una devDependency nueva.
- `index.html` se commitea al repositorio.
- El directorio no era un repo git: se hizo `git init` con un commit base y `.gitignore` (decidido con el usuario).
- Corrección tras la tarea 1: el recuento real de endpoints es 29 (no 31): auth 2, employees 3, restaurant-employees 1, restaurants 4, ingredients 5, dishes 5, public restaurants 2, public dishes 1, orders 5, health 1.
- Hallazgos para el contrato: el formato de error no es uniforme. Los errores de dominio vía `errorHandler` devuelven `{error, message}`; `authenticate`/`authorize` y `OrderController` devuelven solo `{error: "<mensaje>"}`. Se documentan ambos tal cual. En orders, los errores inesperados devuelven 500, y `GET /orders/active` sin `restaurantId` devuelve 400.
