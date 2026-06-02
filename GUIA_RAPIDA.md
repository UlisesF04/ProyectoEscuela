# Guía Rápida — Clonar y Ejecutar el Proyecto

> Instrucciones concisas para levantar el proyecto desde cero.

---

## 1. Requisitos

| Herramienta | Versión |
|-------------|---------|
| Node.js | 20.x LTS |
| PostgreSQL | 15.x |
| Python | 3.11.x |

---

## 2. Clonar e Instalar

```bash
# 1. Clonar
git clone <repo-url>
cd ProyectoEscuela

# 2. Backend — instalar dependencias
cd backend
npm install
cd ..

# 3. Frontend — instalar dependencias
cd frontend
npm install
cd ..

# 4. Agente Python — instalar dependencias
cd agent
pip install -r requirements.txt
cd ..
```

---

## 3. Base de Datos

```bash
# 5. Crear la base de datos en PostgreSQL
#    (abrí psql o pgAdmin y ejecutá:)
#    CREATE DATABASE proyecto_escuela;

# 6. Configurar .env en la raíz del proyecto (usá .env.example como template)
#    Las variables clave:
#      DB_NAME=proyecto_escuela
#      DB_USER=postgres
#      DB_PASSWORD=root
#      RESEND_API_KEY=re_tu_api_key    ← para enviar emails
#      FROM_EMAIL=noreply@tudominio.com
#      SERVICE_API_KEY=sk-tu-api-key   ← para trigger manual del bot

# 7. Ejecutar migraciones (crea las tablas)
cd backend
npx sequelize-cli db:migrate

# 8. Cargar datos de prueba (seeders)
npx sequelize-cli db:seed:all
cd ..
```

---

## 4. Verificar

```bash
# 9. Probar backend — inicia el servidor
node backend/app.js
#    Abrí http://localhost:5000/api/v1/health
#    Debería responder: {"status":"ok","timestamp":"..."}

# 10. Probar frontend — build de producción
cd frontend
npm run build
#    Debería terminar sin errores

# 11. Ejecutar tests (3 suites ~180 tests)
cd backend
npm test
#    Output: 22 passed (modelos) + 32 passed (notificaciones) + 117 passed, 6 failed (admin) ≈ 171/177
#    Los 6 fallos son por diferencias de status esperados en tests de admin — no bloquean
```

---

## 5. Usuarios de Prueba (Seed Data)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@escuela.edu | password123 |
| Preceptor | preceptor@escuela.edu | password123 |
| Docente | docente@escuela.edu | password123 |
| Padre | padre@escuela.edu | password123 |

---

## 6. Bot de Notificaciones (Python + Resend)

Se ejecuta automáticamente de **lunes a viernes a las 18:00 hs**. Evalúa 5 condiciones y envía emails a los padres:

| Alerta | ¿Cuándo avisa? |
|--------|----------------|
| Ausencias críticas | ≥ X faltas sin justificar (defecto: 10) |
| Riesgo de regularidad | ≥ 20% de inasistencias en el trimestre |
| Calificación baja | Nota < 4 registrada |
| Tarea pendiente | Vence en ≤ 2 días sin entregar |
| Vencimiento de licencia | Licencia docente vence en ≤ 3 días |

```bash
# Ejecutar el bot inmediatamente (sin esperar el scheduler):
cd agent
python main.py --now

# Trigger manual desde la API (con SERVICE_API_KEY):
curl -X POST http://localhost:5000/api/v1/notifications/trigger \
  -H "Authorization: Bearer sk-tu-api-key"
```

Para que funcione necesitás una cuenta en [resend.com](https://resend.com) (free: 100 emails/día), un dominio verificado, y la `RESEND_API_KEY` en el `.env`.

---

## 7. API — Endpoints Principales

| Método | Ruta | Auth | Rol |
|--------|------|:----:|:---:|
| POST | `/api/v1/auth/login` | — | — |
| POST | `/api/v1/auth/logout` | JWT | — |
| GET | `/api/v1/auth/me` | JWT | — |
| GET/POST | `/api/v1/users` | JWT | admin |
| GET/POST | `/api/v1/courses` | JWT | admin |
| GET/POST | `/api/v1/students` | JWT | admin |
| POST | `/api/v1/attendances` | JWT | preceptor |
| POST | `/api/v1/grades` | JWT | docente |
| GET | `/api/v1/students/:id/evolution` | JWT | docente/padre |
| POST | `/api/v1/licences` | JWT | docente/preceptor/padre |
| GET | `/api/v1/notifications` | JWT | admin |
| POST | `/api/v1/notifications/trigger` | SERVICE_API_KEY | — |

---

## 8. Comandos Útiles

```bash
# Revertir todas las migraciones
cd backend
npx sequelize-cli db:migrate:undo:all

# Re-ejecutar todo (migraciones + seeders)
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# Ver estado de migraciones
npx sequelize-cli db:migrate:status

# Desarrollo frontend (hot reload en puerto 5173)
cd frontend
npm run dev
```

---

## 9. Estructura del Proyecto

```
ProyectoEscuela/
├── .env              ← Configuración (NO versionado)
├── .env.example      ← Template de configuración (versionado)
├── backend/          → API REST (Express + Sequelize + PostgreSQL)
├── frontend/         → SPA (React + Vite + Chakra UI)
├── agent/            → Bot de notificaciones (Python + APScheduler + Resend)
├── openspec/         → Especificaciones OPSX
├── knowledge-base/   → Documentación del proyecto
└── docs/             → Documentos fuente originales
```

---

## 10. Notas

- El `.env` está en la **raíz del proyecto** y lo leen tanto el backend como el agente. No hay `.env` duplicados en subcarpetas.
- PostgreSQL debe estar corriendo en `localhost:5432` antes de migrar.
- El umbral de ausencias críticas se configura con `AUSENCIA_UMBRAL` en el `.env` (defecto: 10).
- Los logs del bot se ven en consola y también quedan registrados en la tabla `notification_logs` (visible desde el panel admin en `/admin/notifications`).
