# Arquitectura Propuesta

## Patrones aplicados

| Patrón | Dónde se usa | Por qué / Justificación |
|--------|-------------|------------------------|
| **Repository Pattern** | Capa Repository del backend (src/repositories/) | Desacopla la lógica de negocio del ORM. Facilita testing unitario mediante mocks del repositorio. Toda consulta Sequelize vive aquí. |
| **Service Layer** | Capa Service del backend (src/services/) | Centraliza la lógica de negocio. Los controladores solo orquestan request/response. Los repositorios solo acceden a datos. |
| **Middleware Chain** (Chain of Responsibility) | Pipeline de middlewares de Express (auth, roles, validación, errores) | Permite componer comportamientos transversales de forma modular y reutilizable. Cada middleware hace una cosa y pasa al siguiente. |
| **Context + Provider** | Frontend (AuthContext, React Context API) | Gestión de estado global sin dependencias externas. El contexto de autenticación es consumido por cualquier componente sin prop drilling. |
| **Guard / Protected Route** | Frontend (React Router + roleMiddleware) | Protege rutas en el cliente según el rol del usuario autenticado. Doble validación: frontend (UX) + backend (seguridad). |
| **Observer / Event-Driven** | Agente Python de notificaciones | El agente evalúa periódicamente condiciones (eventos) y reacciona disparando notificaciones. Desacoplado del flujo principal de la app. |
| **Transaction Atomicity** | Creación de tareas (task + submissions) | Operación atómica con transacción Sequelize. Todo o nada: si falla una submission, no se crea la tarea ni ninguna submission (RN-14). |

## Estructura de directorios

```
proyecto/
│
├── frontend/                     # React + Vite + Chakra UI
│   ├── public/
│   ├── src/
│   │   ├── pages/                # Componentes de página (una por vista)
│   │   │   ├── LoginPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── PreceptorDashboard.jsx
│   │   │   ├── DocenteDashboard.jsx
│   │   │   └── PadreDashboard.jsx
│   │   ├── components/           # Componentes reutilizables
│   │   │   ├── DataTable.jsx
│   │   │   ├── GradeForm.jsx
│   │   │   ├── AttendanceGrid.jsx
│   │   │   └── ...
│   │   ├── context/              # Contextos globales
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/                # Custom hooks
│   │   │   └── useApi.js
│   │   ├── services/             # Módulos de comunicación con el backend
│   │   │   ├── api.js            # Axios instance con interceptors
│   │   │   ├── authService.js
│   │   │   └── ...
│   │   ├── routes/               # Definición de rutas protegidas por rol
│   │   │   ├── AppRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── utils/                # Funciones auxiliares
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js + Express + Sequelize
│   ├── config/
│   │   └── database.js           # Configuración de conexión PostgreSQL
│   ├── modules/                  # Módulos por dominio
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js
│   │   ├── users/
│   │   ├── students/
│   │   ├── courses/
│   │   ├── attendances/
│   │   ├── grades/
│   │   ├── tasks/
│   │   └── teacher-leaves/
│   ├── models/                   # Modelos Sequelize (definiciones de tabla)
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Course.js
│   │   └── ...
│   ├── repositories/             # Capa de acceso a datos
│   │   ├── userRepository.js
│   │   ├── gradeRepository.js
│   │   └── ...
│   ├── middlewares/              # Middlewares transversales
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── validationMiddleware.js
│   │   └── errorMiddleware.js
│   ├── utils/
│   │   └── AppError.js           # Clase de error personalizada
│   ├── migrations/               # Migraciones Sequelize
│   ├── seeders/                  # Seed data de prueba
│   ├── app.js                    # Configuración de Express
│   └── package.json
│
├── agent/                        # Python + APScheduler + Twilio
│   ├── main.py                   # Punto de entrada, scheduler
│   ├── tasks/
│   │   ├── db_reader.py          # Consultas a PostgreSQL
│   │   ├── notifier.py           # Envío de notificaciones Twilio
│   │   └── alert_engine.py       # Evaluación de condiciones de alerta
│   ├── config.py                 # Configuración (variables de entorno)
│   ├── requirements.txt
│   └── scheduler/
│       └── README.md
│
├── openspec/                     # Especificaciones OPSX
│   ├── changes/                  # Changes activos
│   ├── specs/                    # Especificaciones por capacidad
│   └── ...
│
├── docs/                         # Documentos fuente del proyecto
│
├── knowledge-base/               # ← Base de conocimiento (este directorio)
│
├── .env.example
├── README.md
└── package.json                  # Raíz del monorepo (opcional)
```

## Seguridad

### Autenticación
- **Esquema**: JWT (HS256) con expiración de 8 horas
- **Payload del token**: `{ id, role, email, iat, exp }`
- **Hashing de contraseñas**: bcrypt con 12 rounds
- **Refresh token**: No implementado en MVP. Se evaluará en fase 2.

### Autorización
- **Backend**: Middleware `authMiddleware` (valida JWT) + `roleMiddleware` (verifica rol) en cada endpoint protegido
- **Frontend**: `ProtectedRoute` de React Router redirige a /login o /unauthorized según rol
- **Principio**: El backend es la autoridad final. El frontend solo oculta rutas por UX, no por seguridad.

### Validación de input
- **Backend**: `express-validator` o `Joi` aplicado en todos los endpoints POST y PUT, antes del controller
- **Frontend**: Validación cliente para feedback inmediato (no reemplaza la del backend)

### Rate limiting
- **Límite global**: 100 requests / 15 min por IP
- **Límite /auth/login**: 10 intentos / 15 min por IP (protección contra fuerza bruta)
- **Librería**: `express-rate-limit`

### Otras medidas
- **CORS**: Solo el dominio del frontend en producción
- **Subida de archivos**: Solo JPG/PNG/PDF ≤ 5MB, almacenados en servicio externo (Cloudinary o Railway Volumes), nunca en el servidor de la aplicación
- **Secrets**: Variables de entorno nunca versionadas en el repositorio

## Variables de entorno

| Variable | Descripción | Ejemplo | ¿Sensible? |
|----------|-------------|---------|:----------:|
| `DATABASE_URL` | Connection string de PostgreSQL | `postgresql://user:pass@host:5432/db` | Sí |
| `JWT_SECRET` | Clave secreta para firmar tokens (≥ 32 caracteres) | `una-clave-muy-segura-de-al-menos-32-chars` | Sí |
| `TWILIO_ACCOUNT_SID` | SID de cuenta Twilio | `ACxxxxxxxxxxxxxxxx` | Sí |
| `TWILIO_AUTH_TOKEN` | Token de autenticación Twilio | `xxxxxxxxxxxxxxxx` | Sí |
| `TWILIO_WHATSAPP_FROM` | Número WhatsApp de Twilio | `+14155238886` | Sí |
| `CLOUDINARY_URL` | URL de Cloudinary (si se usa) | `cloudinary://api_key:api_secret@cloud` | Sí |
| `SERVICE_API_KEY` | API Key para endpoint interno del agente Python | `sk-abc123...` | Sí |
| `FRONTEND_URL` | URL del frontend para CORS | `https://app.vercel.app` | No |
| `PORT` | Puerto del backend | `3000` | No |
| `NODE_ENV` | Entorno de ejecución | `development` / `production` | No |

## Arquitectura del backend en capas (detalle)

```
HTTP Request
    │
    ▼
┌──────────────────────────────────────────────┐
│           MIDDLEWARES TRANSVERSALES           │
│  auth → role → validation → error handler    │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│          ROUTER (Express Router)              │
│  /api/v1/auth  /api/v1/students  /api/v1/... │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│              CONTROLLER                       │
│  Extrae params/body → llama Service → res     │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│               SERVICE                         │
│  Lógica de negocio + reglas (RN) + orquesta   │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│             REPOSITORY                        │
│  Toda interacción con Sequelize               │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│           MODEL (Sequelize)                   │
│  Definición de tabla + asociaciones           │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│          PostgreSQL Database                  │
└──────────────────────────────────────────────┘
```

## Arquitectura del frontend

```
AuthContext (Provider)
    │
    ▼
AppRoutes
    │
    ├── /login → LoginPage (público)
    │
    ├── ProtectedRoute (role='admin') → AdminDashboard
    │       ├── UsersPage
    │       ├── CoursesPage
    │       └── LeavesPage
    │
    ├── ProtectedRoute (role='preceptor') → PreceptorDashboard
    │       ├── AttendanceRegister
    │       └── AttendanceHistory
    │
    ├── ProtectedRoute (role='docente') → DocenteDashboard
    │       ├── GradesPage
    │       └── TasksPage
    │
    └── ProtectedRoute (role='padre') → PadreDashboard
            ├── ChildGrades
            ├── ChildAttendances
            ├── ChildTasks
            └── UploadCertificate
```

## Lógica del agente automatizado (Python)

El agente se ejecuta diariamente (post-jornada escolar, ej: 18:00 hs) y realiza 5 evaluaciones:

| Alerta | Condición | Destinatario | Prioridad |
|--------|-----------|--------------|:---------:|
| AUSENCIAS_CRITICAS | ≥ X inasistencias no justificadas (X configurable, defecto: 10) | Padre/tutor | Alta |
| RIESGO_REGULARIDAD | ≥ 20% de inasistencias sobre total de clases del trimestre | Padre/tutor | Alta |
| CALIFICACION_BAJA | Calificación < 4 registrada | Padre/tutor | Alta |
| TAREA_PENDIENTE | Tarea vence en ≤ 2 días + no entregada | Padre/tutor | Media |
| LICENCIA_DOCENTE_VENCIMIENTO | Licencia aprobada vence en ≤ 3 días | Docente + Admin | Media |

**Arquitectura del agente**:
```
main.py (scheduler APScheduler)
    │
    ├── db_reader.py → Consulta PostgreSQL (SQL directo)
    │       │
    │       └── Retorna: list[dict] con datos de alertas
    │
    └── notifier.py → Envía WhatsApp vía Twilio SDK
            │
            └── Registra en notification_logs (INSERT vía psycopg2)
```
