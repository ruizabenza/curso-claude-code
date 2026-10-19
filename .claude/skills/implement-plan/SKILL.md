---
name: implement-plan
description: Implementa un plan generado con plan-feature en un git worktree aislado, tarea a tarea con TDD estricto, haciendo un commit por tarea y marcándola como hecha en el plan, hasta cumplir los criterios de aceptación. Úsala cuando el usuario pida implementar, ejecutar o llevar a cabo un plan.
argument-hint: [ruta al plan o plan pegado en la conversación]
---

Implementa el plan que indica el usuario, siguiendo el flujo de abajo sin saltarte pasos.

Plan (ruta o texto; puede estar vacío): $ARGUMENTS

## 0. Localizar el plan

- Si `$ARGUMENTS` es una ruta a un archivo, léelo.
- Si está vacío, usa el plan más reciente de la conversación. Si no hay ninguno, pregunta con `AskUserQuestion` dónde está.
- Si el plan solo existe en la conversación (sin archivo), guárdalo en el worktree (paso 1) como `PLAN.md` para poder marcar las tareas. Antes de crearlo, comprueba que `PLAN.md` no existe ya en el repositorio.
- El plan debe tener la estructura de `plan-feature`: tareas numeradas con `- [ ]` y criterios de aceptación. Si falta alguna de las dos cosas, detente y pide al usuario que lo complete.
- Lee también `CLAUDE.md`: la arquitectura en capas y las reglas de comportamiento aplican a todo lo que implementes.

## 1. Crear el worktree

1. Comprueba con `git status` que sabes en qué rama estás. Esa será la rama base.
2. Elige un nombre de rama corto en kebab-case derivado del título del plan, con prefijo según el tipo (`feat/`, `fix/`, `refactor/`).
3. Crea el worktree fuera del árbol de trabajo, como carpeta hermana del repositorio:
   `git worktree add ../<repo>-<slug> -b <rama>`
   Si la rama o la carpeta ya existen, no las sobrescribas: pregunta al usuario si reutilizarlas o usar otro nombre.
4. **A partir de aquí trabaja siempre dentro del worktree** (rutas absolutas). No modifiques el directorio original.
5. Si el plan es un archivo sin versionar o con cambios sin commitear en el repositorio original, cópialo al mismo path relativo dentro del worktree. Esa copia es la única que se edita a partir de ahora.
6. Entorno: el worktree no contiene `.venv` ni `.env` (no se versionan). Usa el intérprete del repo original (`<repo>/.venv/bin/python -m pytest`) ejecutándolo con el worktree como directorio de trabajo. Si no existe `.venv`, créalo en el worktree con `python -m venv .venv && .venv/bin/pip install -r requirements.txt`.
7. Ejecuta `pytest` para fijar la línea base. Si ya falla antes de tocar nada, avisa al usuario y pregunta cómo seguir.

## 2. Bucle de tareas

Procesa las tareas **en orden, de una en una**, empezando por la primera sin marcar. Para cada tarea:

1. **Red.** Escribe primero el test que describe el comportamiento de la tarea y ejecútalo. Debe fallar, y por la razón correcta (comportamiento ausente, no un error de import o de sintaxis). Si pasa sin código nuevo, el test no prueba nada: corrígelo.
2. **Green.** Escribe el código mínimo para que ese test pase, y nada más. Ejecuta el test.
3. **Refactor.** Limpia con los tests en verde, sin añadir comportamiento.
4. **Regresión.** Ejecuta `pytest` completo. Debe pasar entero antes de seguir.
5. **Marcar.** Cambia `- [ ]` por `- [x]` solo en esa tarea del plan.
6. **Commit.** Haz un commit con el código, los tests y el plan actualizado. Sigue el formato Conventional Commits del proyecto (puedes usar la skill `commit`), con mensaje en español, y añade la atribución que indique el sistema. Añade los archivos por nombre, nunca `git add -A`, para no colar `.db`, `.env` ni otros archivos ajenos.
7. Pasa a la siguiente tarea.

Reglas de TDD estricto:

- Nunca escribas código de producción sin un test en rojo que lo exija.
- Una tarea puramente de tests (por ejemplo, "añadir tests de X") se trata igual: el test debe fallar antes de implementar, o, si el comportamiento ya existe, documenta en el commit que es un test de caracterización.
- Una tarea sin comportamiento testeable (config, docs, renombrados) no requiere test nuevo, pero la suite debe seguir en verde. Dilo explícitamente en lugar de inventar un test vacío.
- Para un `fix`, el test que reproduce el fallo debe verse fallar antes de arreglar. Para un `refactor`, ningún test existente puede cambiar de comportamiento esperado.
- Respeta las capas: cada tarea toca solo lo que su capa permite. Los tests usan una base de datos temporal con `monkeypatch.setenv("DATABASE_PATH", ...)` y `TestClient` como context manager.
- No amplíes el alcance. Si descubres trabajo necesario que el plan no recoge, anótalo en "Riesgos y notas" del plan y comunícalo al final; no lo implementes sin preguntar.

Si una tarea se atasca (tras un par de intentos razonables el test no pasa, o el plan es contradictorio con el código), detente, no hagas commit de código roto y consulta al usuario con lo que has intentado.

## 3. Criterios de aceptación

Cuando todas las tareas estén marcadas:

1. Recorre los criterios de aceptación uno por uno y compruébalos de verdad (un test que lo cubra, o ejecutando la API si es un comportamiento observable). No los marques por suposición.
2. Si un criterio no se cumple, no está cubierto por ningún test o revela un hueco, añade la tarea necesaria al plan y ejecútala con el mismo bucle del paso 2.
3. Marca cada criterio cumplido con `- [x]`, incluido el de `pytest` pasa, tras ejecutar la suite completa por última vez.
4. Haz un último commit `docs:` con el plan actualizado si quedan cambios sin commitear.

## 4. Cierre

Informa al usuario, en español y brevemente, de:

- Ruta del worktree y nombre de la rama.
- Lista de commits creados (`git log --oneline <base>..HEAD`).
- Estado de cada criterio de aceptación y resultado final de `pytest`.
- Cualquier desviación, nota añadida al plan o tarea no resuelta.

**No hagas merge, push ni elimines el worktree** salvo que el usuario lo pida; ofrécele esas opciones.
