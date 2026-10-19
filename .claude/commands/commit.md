---
description: Crea un commit siguiendo el formato Conventional Commits
argument-hint: [contexto o pista opcional sobre el cambio]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
---

Crea un commit de git que siga la especificación Conventional Commits 1.0.0.

## Contexto

- Estado: !`git status --short`
- Cambios en staging: !`git diff --cached`
- Cambios sin stage: !`git diff`
- Commits recientes (para ver el estilo): !`git log --oneline -10`

Pista del usuario (puede estar vacía): $ARGUMENTS

## Formato

```
<tipo>(<ámbito opcional>): <descripción>

<cuerpo opcional>

<pie opcional>
```

Tipos permitidos:

- `feat`: nueva funcionalidad
- `fix`: corrección de un bug
- `docs`: solo documentación
- `style`: formato sin cambio de comportamiento
- `refactor`: cambio de código que ni corrige un bug ni añade funcionalidad
- `perf`: mejora de rendimiento
- `test`: añadir o corregir tests
- `build`: dependencias o sistema de build (por ejemplo `requirements.txt`)
- `ci`: configuración de integración continua
- `chore`: tareas de mantenimiento que no tocan `app/` ni los tests
- `revert`: revierte un commit anterior

## Reglas

1. La descripción va en imperativo, en minúscula, sin punto final y con un máximo de 72 caracteres.
2. El ámbito, si se usa, es la capa o módulo afectado (por ejemplo `auth`, `routes`, `services`, `repositories`, `db`, `config`).
3. Un cambio incompatible se marca con `!` tras el tipo/ámbito (`feat(auth)!: ...`) y un pie `BREAKING CHANGE: ...`.
4. Usa el cuerpo solo si explica el porqué del cambio; no repitas el diff.
5. Escribe el mensaje en el mismo idioma que los commits recientes; si no hay historial, en español.
6. Si los cambios mezclan propósitos distintos, propón dividirlos en varios commits y haz uno por cada grupo coherente.

## Pasos

1. Si no hay ningún cambio, díselo al usuario y detente.
2. Si hay cambios en staging, comitea solo esos. Si no hay ninguno, añade con `git add` los archivos relevantes por su nombre. No uses `git add -A` ni `git add .`, y no añadas `.env`, `*.db` ni otros secretos o archivos generados.
3. Elige el tipo y el ámbito a partir del diff y redacta el mensaje.
4. Usa la tool `AskUserQuestion` para mostrarle al usuario el mensaje del commit, y que decida si le parece bien. Si te da el ok, continua. Si te dice que no, proponle otro mensaje y vuelve a preguntarle.
5. Ejecuta `git commit` pasando el mensaje con `-m` (un `-m` por párrafo). Termina el mensaje con las líneas de atribución que indique el sistema, si las hay.
6. No uses `--no-verify` ni `--amend`, y no hagas `git push`.
7. Muestra el hash y el mensaje del commit creado.
