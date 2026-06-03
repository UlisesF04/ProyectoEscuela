## Why

El sistema completo (backend, frontend, agente Python) se sometió a una auditoría automatizada de seguridad pre-producción que reveló **71 hallazgos**: 11 críticos, 20 altos, 26 medios y 14 bajos. Estos incluyen JWT con fallback hardcodeado, IDORs en endpoints críticos (notas, licencias, asistencias), mass assignment, ausencia de security headers, dependencias con vulnerabilidades conocidas, y fugas de información. Sin remediación, el sistema no puede deployarse a producción de forma segura.

## What Changes

- **Backend security hardening**: Eliminar fallback JWT, agregar authorization checks en grades/licences/attendances, reemplazar `sync({ alter: true })`, implementar whitelist de campos en updates, instalar helmet + CSP.
- **Frontend security hardening**: Migrar JWT de localStorage a httpOnly cookie, agregar rel="noopener noreferrer", implementar CSP via meta tag.
- **Auth improvements**: Agregar password change endpoint, account-level lockout, refresh token rotation.
- **Dependency remediation**: Upgrade express@4.22.2, bcrypt@6.0.0, forzar uuid@>=11.1.1, mover pg/pg-hstore a dependencies.
- **DevOps hardening**: Crear CI/CD pipeline, fix root .gitignore, completar vercel.json con headers de seguridad, crear railway.json, pin .node-version.
- **Agent Python hardening**: Sanitizar logging de PII/credenciales, validar env vars al startup, agregar sslmode en conexión DB.
- **Database hardening**: Agregar índices faltantes, unique constraints, defaultScope en User model para password_hash, validaciones de modelo.
- **Infrastructure**: Agregar request body size limit, rate limiting por endpoint de auth, HTTPS enforcement.

## Capabilities

### New Capabilities

Ninguna — este change no introduce nuevas funcionalidades. Es exclusivamente de endurecimiento y remediación.

### Modified Capabilities

- `auth`: Nuevos requisitos de seguridad (password change, refresh tokens, account lockout)
- `admin-config`: Validación de configuración hardening
- `database-config`: Nuevos índices y constraints

## Impact

- **Backend**: Todos los módulos (auth, grades, attendances, licences, users) — modificaciones en services, routes, middlewares
- **Frontend**: AuthContext, api.js, ProtectedRoute, JustificacionesPage, JustificativosPage, ErrorBoundary
- **Agente Python**: notifier.py, config.py, alert_engine.py, db_reader.py
- **Infraestructura**: .gitignore, vercel.json, railway.json, .node-version, .github/workflows/
- **Dependencias**: backend/package.json (upgrades: express, bcrypt; fixes: pg, pg-hstore; add: helmet, compression)
