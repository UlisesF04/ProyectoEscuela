# AGENTS.md — ProyectoEscuela

## Reglas de trabajo

- No ejecutar builds (incluidos Docker) ni hacer commits sin pedido explícito. Usar Conventional Commits, sin `Co-Authored-By`.
- Ante decisiones arquitectónicas no triviales o requisitos ambiguos, presentar enfoque, alternativas y recomendación; esperar aprobación antes de implementar.
- Antes de `/opsx:propose`, leer `Documentation/CHANGES.md` y la KB del dominio; verificar dependencias completadas. Para agregar changes o cambiar alcance/dependencias, mostrar el diff del roadmap y esperar aprobación.
- Antes de `/opsx:archive`, deben pasar las suites del change. Al archivar, actualizar inmediatamente estado y fecha en el roadmap y cualquier referencia afectada en este archivo.

## Mapa y fuentes

- Node.js 24 (`.node-version`). Backend y frontend tienen instalaciones/lockfiles independientes; no hay workspace ni `package.json` raíz. Usar `npm --prefix backend ...` / `npm --prefix frontend ...`.
- Backend: CommonJS + Express 4. `backend/app.js` monta `/api/v1` y exporta la app para tests; inicializa la BD y escucha solo al ejecutarse directamente. Las asociaciones Sequelize se registran en `backend/models/index.js`; importar los modelos desde ese índice.
- Frontend activo: React 18 + JSX, Chakra UI 2, Router 7 y Vite 8. Entrada: `frontend/src/main.jsx`; rutas: `frontend/src/routes/AppRoutes.jsx`. `Diseño Front/` es un prototipo independiente React 19/Tailwind.
- `agent/main.py` consulta PostgreSQL directamente: revisar `agent/tasks/` al cambiar el esquema. El backend lo lanza con `python ... --now`; sin ese flag inicia el scheduler. Compose incluye Python pero no inicia el scheduler.
- Documentación vigente de arranque: `README.md` raíz. Dominio: `Documentation/knowledge-base/`. Roadmap: `Documentation/CHANGES.md`. `Documentation/README.md` es histórico; ante contradicciones de ejecución, mandan scripts/configuración. Mantener `AGENTS.md`, `.agents/skills/` y `openspec/` en sus rutas de descubrimiento.
- C-12 `devops-deployment` sigue en progreso: Docker local implementado, cloud/CI pendientes; todavía no hay workflows en `.github/`. No inferir despliegue completo por el cierre de C-14.

## Entorno local

- Docker Desktop debe usar contenedores Linux. Configurar `.env.docker` desde `.env.docker.example` según el README; en un entorno nuevo confirmar con el usuario nombre/credenciales de BD, sin asumir los ejemplos.
- Compose usa `.env.docker`; Node fuera de Docker carga `backend/.env` por ruta absoluta; Python fuera de Docker carga `.env` raíz; Vite usa `frontend/.env`. No versionar estos archivos.
- `DATABASE_URL` tiene prioridad sobre `DB_*`; Compose lo vacía explícitamente para conectar al servicio PostgreSQL interno, separado de la BD nativa del equipo.

Comandos desde la raíz, con `.env.docker` configurado e imagen ya construida:

```sh
docker compose --env-file .env.docker up -d --wait
npm --prefix frontend ci
npm --prefix frontend run dev
```

- Primer build o cambios de backend: `docker compose --env-file .env.docker up --build -d --wait`. No hay bind mount del código; reiniciar no incorpora cambios.
- Vite fija el puerto 5173 (`strictPort`) y proxifica `/api` a `localhost:5000`. Al cambiar `BACKEND_PORT`, ajustar `VITE_PROXY_TARGET` en `frontend/.env`. Health con acceso real a BD: `/api/v1/health`.
- `docker compose --env-file .env.docker down` conserva BD y uploads; `down -v` los elimina. Cambiar `DB_PASSWORD` en el archivo no cambia la contraseña de un volumen PostgreSQL existente.

## Inicialización de datos

- El arranque usa `backend/config/initializeDatabase.js` → `sequelize.sync`; `DB_SYNC_ALTER=true` solo altera tablas en desarrollo. Las migraciones heredadas no crean todas las tablas: `npx sequelize-cli db:migrate` por sí solo no inicializa una base vacía.
- Fuera de Docker: instalar con `npm --prefix backend ci`; inicializar con `npm --prefix backend run db:init -- --seed`; iniciar con `npm --prefix backend run dev` (sin watcher). Usa `backend/.env`.
- `backend/utils/seedDemoData.js` carga demo transaccionalmente solo si usuarios/cursos/materias/alumnos están vacíos, contando borrados lógicos. No restablece contraseñas. Cuentas: `{admin,preceptor,docente,padre}@escuela.edu`; clave inicial: `DEMO_PASSWORD` (mínimo 8 caracteres), independiente de `DB_PASSWORD`. Seeding prohibido en producción.

## Verificación

- Usar PostgreSQL real en contenedor, sin agregar mocks de BD. Las suites Node alteran/borran datos y algunas recrean tablas; ejecutarlas en `compose.test.yaml`, nunca contra la BD de desarrollo. Son scripts `node`, no Jest; las pruebas HTTP levantan su propio servidor.
- La imagen de test ejecuta `test:bootstrap` antes de `npm test`; `npm test` solo no prepara fixtures. Compose fija la contraseña de prueba y usa otro proyecto con PostgreSQL en `tmpfs`. Reiniciar desde limpio evita residuos entre ejecuciones.

Suite completa desde la raíz:

```sh
docker compose -f compose.test.yaml down
docker compose -f compose.test.yaml up --build --abort-on-container-exit --exit-code-from backend-test
docker compose -f compose.test.yaml down
```

Una suite, por ejemplo evolución (cambiar el archivo para otra suite):

```sh
docker compose -f compose.test.yaml down
docker compose -f compose.test.yaml run --build --rm backend-test sh -c "npm run test:bootstrap && node tests/evolution.test.js"
docker compose -f compose.test.yaml down
```

- Frontend: `npm --prefix frontend run build`. `lint` imprime un error y termina con código 0; no valida código. `eslint.config.js` referencia dependencias no instaladas; no hay scripts de test/typecheck.
- Python: desde `agent/`, `python -m unittest discover -s tests`. Sus tests heredados usan mocks de psycopg2/Resend y no verifican integración con PostgreSQL.

## Frontend obligatorio

- Antes de cualquier implementación frontend, cargar `emil-design-eng`, `design-taste-frontend` e `impeccable`; revisar otras skills pertinentes en `.agents/skills/`. Si alguna obligatoria falta o falla, avisar y detenerse. Pasar el checklist de impeccable antes de cerrar UI.
- Mantener C-13: paleta Cozy Chocolate Cream de `frontend/src/theme.js`, componentes compartidos, `frontend/src/components/DashboardLayout.jsx` y rutas por rol. Referencias: `Documentation/VISTAS.md` y `Documentation/Diseño Front/CANONICAL_SYS_VISTAS.md`. Archivos de componentes nuevos en kebab-case (`.jsx`).
- La sesión del navegador usa cookie httpOnly `authToken`; `AuthContext` la restaura con `/auth/me`. Reutilizar `frontend/src/services/api.js` (`withCredentials: true`); no introducir JWT en localStorage pese a comentarios históricos que lo mencionan.
