---
name: plan-feature
description: Planifica un nuevo desarrollo, una corrección de código o un refactor siguiendo la plantilla template.md (objetivo, tareas de 5-10 min y criterios de aceptación). Úsala antes de implementar cualquier cambio no trivial.
argument-hint: [descripción del desarrollo, corrección o refactor]
---

Genera un plan de trabajo para el cambio que pide el usuario. **No implementes nada**: tu salida es solo el plan.

Petición del usuario (puede estar vacía): $ARGUMENTS

## Pasos

1. Si la petición está vacía o es demasiado ambigua para planificar, usa `AskUserQuestion` para aclararla. No preguntes lo que puedas averiguar leyendo el código.
2. Identifica el tipo de cambio: `feature` (nuevo desarrollo), `fix` (corrección) o `refactor`.
3. Explora el código relevante antes de planificar. Lee `CLAUDE.md` y los archivos de las capas afectadas (`routes → controllers → services → repositories → models`) y los tests existentes. Los planes deben respetar la arquitectura en capas y las reglas de comportamiento que indica `CLAUDE.md`.
4. Lee [template.md](template.md) y rellénalo respetando su estructura y sus secciones, sin añadir ni quitar ninguna.
5. Muestra el plan al usuario en la conversación y pregúntale si quiere ajustarlo. No crees archivos salvo que lo pida.

## Reglas para las tareas

- Cada tarea debe poder hacerse en **5-10 minutos**. Si una tarea parece mayor, divídela.
- Cada tarea es concreta y verificable: indica el archivo o la capa que toca y qué se hace (por ejemplo, "Añadir `get_by_id` en `app/repositories/user_repository.py`").
- Ordénalas de la capa más baja a la más alta (models → repositories → services → controllers → routes) e incluye las tareas de tests junto a lo que prueban.
- Para un `fix`, la primera tarea es escribir un test que reproduzca el fallo.
- Para un `refactor`, la primera tarea es comprobar que los tests actuales pasan, y el comportamiento externo no debe cambiar.
- Numera las tareas y estima los minutos de cada una.

## Reglas para los criterios de aceptación

- Son condiciones observables y comprobables, no tareas (por ejemplo, "`POST /auth/login` devuelve 401 con credenciales inválidas").
- Incluye siempre que `pytest` pasa y que se mantienen las reglas de comportamiento de `CLAUDE.md` que afecten al cambio.
- Cubre el caso feliz y al menos un caso de error o límite.

## Idioma

Escribe el plan en español.
