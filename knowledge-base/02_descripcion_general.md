# Descripción General

## Stack tecnológico

| Capa | Tecnología | Versión | Justificación |
|------|-----------|---------|---------------|
| Frontend | React.js | 18.x / 19.x | Ecosistema maduro, componentes reutilizables, amplia comunidad |
| UI Library | Chakra UI | 2.x / v3 | Sistema de diseño accesible, responsivo, reduce tiempo de desarrollo |
| Routing | React Router | v6 | Enrutamiento declarativo con soporte nativo para rutas protegidas |
| Estado global | Context API + useReducer | — | Escala suficiente para MVP, evita complejidad de Redux |
| Build tool | Vite | — | Arranque rápido, HMR eficiente, configuración mínima |
| Backend runtime | Node.js | 20.x LTS | Mismo lenguaje que frontend, alto rendimiento I/O |
| Backend framework | Express.js | 4.x | Minimalista, flexible, arquitectura en capas clara |
| ORM | Sequelize | 6.x | Abstracción robusta sobre PostgreSQL, migraciones y validaciones |
| Autenticación | JWT + bcrypt | — | Stateless, adecuado para REST. bcrypt rounds = 12 |
| Base de datos | PostgreSQL | 15.x | Relacional ACID, modelo de datos con relaciones complejas |
| Agente automatizado | Python | 3.11.x | Ecosistema maduro para procesamiento y automatización |
| Agente librerías | Pandas, APScheduler, Twilio SDK | — | Procesamiento, scheduler CRON, WhatsApp API |
| Control de versiones | Git + GitHub | — | Monorepo con carpetas /frontend, /backend, /agent |
| CI/CD | GitHub Actions | — | Tests automáticos + despliegue continuo |

## Arquitectura general

```
[Navegador Web]
     │  HTTPS
     ▼
[Frontend — React + Vite / Vercel]
     │  REST (JSON) + JWT Bearer
     ▼
[Backend — Node.js + Express / Railway]
     │  Sequelize ORM
     ▼
[Base de Datos — PostgreSQL 15 / Railway]
     ▲
     │  Consulta directa (SQL)
[Agente Python — APScheduler + Twilio / Railway Worker]
     │  WhatsApp Business API (Twilio)
     ▼
[Padres y Docentes — WhatsApp]
```

### Decisiones de alto nivel

1. **Monorepo con tres componentes separados**: frontend, backend y agente comparten el mismo repositorio pero se despliegan de forma independiente. Evita la fragmentación de repos al tiempo que permite CI/CD específico por componente.
2. **Separación agente ↔ app web**: El agente Python corre como worker independiente. No comparte código con el backend Node.js. Se comunica con la BD directamente vía SQL. Esto permite escalarlo o modificarlo sin afectar la API REST.
3. **Sin refresh tokens en MVP**: La sesión JWT expira a las 8h (jornada escolar). Se evaluará refresh token en fase 2 si la rotación de tokens se vuelve necesaria.

## Integraciones externas

| Servicio | Propósito | Tipo | Estado |
|----------|-----------|------|--------|
| Twilio | Envío de notificaciones WhatsApp | SDK Python + REST API | Sandbox → Producción |
| Cloudinary o Railway Volumes | Almacenamiento de certificados de justificación | HTTP upload + URL | A definir |
| Vercel | Hosting del frontend (SPA) | Deploy automático desde GitHub | Configurado |
| Railway | Hosting del backend + BD PostgreSQL + agente worker | Deploy automático desde GitHub | Configurado |

## Resumen de API REST

Base URL: `/api/v1` · Autenticación: Bearer JWT

| Módulo | Endpoints principales | Roles permitidos |
|--------|----------------------|------------------|
| Auth | POST `/auth/login`, POST `/auth/logout`, GET `/auth/me` | Todos (login sin auth) |
| Users | GET/POST `/users`, GET/PUT/DELETE `/users/:id` | Admin |
| Students | GET/POST `/students`, GET/PUT `/students/:id` | Admin, Preceptor, Docente (lectura parcial) |
| Courses | GET/POST `/courses`, GET `/courses/:id/subjects`, POST `/courses/:id/subjects` | Admin |
| Subjects | POST `/subjects/:id/teachers` | Admin |
| Grades | GET `/students/:id/grades`, POST `/grades`, PUT/DELETE `/grades/:id` | Docente (escritura), resto lectura |
| Attendances | GET `/students/:id/attendances`, POST `/attendances`, PUT `/attendances/:id`, POST `/attendances/:id/justify` | Preceptor (escritura), resto lectura |
| Tasks | GET `/subjects/:id/tasks`, POST/PUT/DELETE `/tasks/:id`, GET `/tasks/:id/submissions`, PUT `/tasks/:taskId/submissions/:studentId` | Docente (escritura), resto lectura |
| Teacher Leaves | GET `/teacher-leaves`, GET `/teacher-leaves/me`, POST `/teacher-leaves`, PUT `/teacher-leaves/:id/status` | Docente (solicitud), Admin (aprobación) |
| Certificates | POST `/certificates/upload` | Padre, Preceptor, Admin |
| Notifications | GET `/notifications/logs`, POST `/notifications/trigger` (interno) | Admin, Service API Key |

~40 endpoints en total.
