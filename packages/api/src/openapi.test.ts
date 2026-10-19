import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'

const spec = parse(readFileSync(resolve(__dirname, '../../../docs/api/openapi.yaml'), 'utf8'))

// Rutas registradas en src/app.ts (relativas a /api/v1, salvo /health). Hay que mantenerla sincronizada.
const ROUTES: Array<[string, string]> = [
    ['post', '/auth/login'],
    ['post', '/auth/register'],
    ['post', '/employees'],
    ['get', '/employees'],
    ['get', '/employees/{id}'],
    ['get', '/restaurants/{restaurantId}/employees'],
    ['post', '/restaurants'],
    ['get', '/restaurants'],
    ['get', '/restaurants/{id}'],
    ['put', '/restaurants/{id}'],
    ['get', '/public/restaurants'],
    ['get', '/public/restaurants/{id}'],
    ['get', '/public/restaurants/{restaurantId}/dishes'],
    ['post', '/restaurants/{restaurantId}/ingredients'],
    ['get', '/restaurants/{restaurantId}/ingredients'],
    ['get', '/restaurants/{restaurantId}/ingredients/{id}'],
    ['put', '/restaurants/{restaurantId}/ingredients/{id}'],
    ['delete', '/restaurants/{restaurantId}/ingredients/{id}'],
    ['post', '/restaurants/{restaurantId}/dishes'],
    ['get', '/restaurants/{restaurantId}/dishes'],
    ['get', '/restaurants/{restaurantId}/dishes/{id}'],
    ['put', '/restaurants/{restaurantId}/dishes/{id}'],
    ['delete', '/restaurants/{restaurantId}/dishes/{id}'],
    ['post', '/orders'],
    ['get', '/orders/active'],
    ['get', '/orders/mine'],
    ['get', '/orders/{id}'],
    ['patch', '/orders/{orderId}/items/{itemId}/status'],
    ['get', '/health']
]

describe('contrato OpenAPI', () => {
    it('es OpenAPI 3.x', () => {
        expect(spec.openapi).toMatch(/^3\./)
    })

    it.each(ROUTES)('documenta %s %s', (method, path) => {
        expect(spec.paths?.[path]?.[method]).toBeDefined()
    })

    it('no documenta operaciones que no existan en la API', () => {
        const documented = Object.entries(spec.paths).flatMap(([path, item]: [string, any]) =>
            ['get', 'post', 'put', 'patch', 'delete']
                .filter(m => item[m])
                .map(m => `${m} ${path}`)
        )
        expect(documented.sort()).toEqual(ROUTES.map(([m, p]) => `${m} ${p}`).sort())
    })

    it('las rutas con auth declaran bearerAuth y las públicas no', () => {
        const isPublic = (path: string) => path.startsWith('/public') || path.startsWith('/auth') || path === '/health'
        for (const [method, path] of ROUTES) {
            const security = spec.paths[path][method].security
            if (isPublic(path)) expect(security, `${method} ${path}`).toEqual([])
            else expect(security, `${method} ${path}`).toEqual([{ bearerAuth: [] }])
        }
    })

    it('documenta el 400 del PATCH de estado con pedido inexistente', () => {
        const op = spec.paths['/orders/{orderId}/items/{itemId}/status'].patch
        expect(op.responses['400']).toBeDefined()
        expect(op.responses['404']).toBeUndefined()
    })
})
