## Context

Auditoría automatizada del 2026-06-02 mediante 5 sub-agentes de exploración que analizaron backend (60+ files), frontend (30+ files), agente Python (5 files), config/deploy (10+ files), y base de datos (modelos, migraciones, repositorios, seeders).

Resultado: 71 hallazgos categorizados por severidad. Este change los aborda en 3 fases.

## Goals / Non-Goals

**Goals:**
- Eliminar todos los hallazgos CRITICAL (12) y HIGH (20) antes del deploy a producción
- Reducir los MEDIUM/LOW a deuda técnica documentada post-producción
- Establecer CI/CD pipeline para prevenir regresiones de seguridad
- Agregar security headers (helmet, CSP, HSTS) en backend y frontend

**Non-Goals:**
- NO migrar a Sequelize v7 (sería C-12 o change separado)
- NO migrar a React 19 / Chakra v3 (fuera de scope)
- NO rediseñar UI ni agregar nuevas features
- NO implementar forgot-password flow con email (requiere integración SMTP adicional)

## Decisions

### D1: httpOnly cookies en vez de localStorage para JWT
- **Opción A (elegida)**: Backend setea JWT en httpOnly Secure SameSite=Strict cookie en login, frontend usa `withCredentials: true` en axios
- **Opción B**: Mantener localStorage + CSP estricto para mitigar XSS
- **Por qué A**: Elimina completamente el vector de ataque XSS→token robo. La migración es directa: el backend cambia `res.json({ token })` por `res.cookie('token', jwt, { httpOnly, secure, sameSite })`, y frontend remueve localStorage handling.

### D2: Whitelist de campos vs class-validator/reflect-metadata
- **Opción A (elegida)**: Whitelist manual en cada service update method
- **Opción B**: Usar class-validator con decoradores en modelos
- **Por qué A**: Sin dependencias nuevas, explícito, fácil de auditar. El patrón es simple: `const allowed = ['email', 'name']; const filtered = {}; allowed.forEach(k => { if (data[k] !== undefined) filtered[k] = data[k]; })`

### D3: Password change endpoint vs forgot-password flow
- **Opción A (elegida)**: Solo `PUT /api/v1/auth/password` con old-password validation
- **Opción B**: forgot-password completo con email token
- **Por qué A**: No tenemos servicio SMTP configurado aún. El password change cubre el caso de uso inmediato. Forgot-password queda como mejora futura.

### D4: Account lockout en DB vs Redis
- **Opción A (elegida)**: Columna `failed_attempts` + `locked_until` en tabla `users`
- **Opción B**: Redis con TTL
- **Por qué A**: Sin dependencia externa, consistente con la arquitectura actual (sin Redis). La tabla users se consulta en cada login de todas formas. TTL se maneja con timestamp.

### D5: npm overrides vs fork para uuid
- **Opción A (elegida)**: Agregar `overrides` en `package.json` para forzar uuid@11.1.1
- **Opción B**: Upgrade a Sequelize v7 (dropea uuid dependency)
- **Por qué A**: Sequelize v7 es un breaking change mayor. Los overrides son el approach recomendado por npm para transitive dependency fixes.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| httpOnly cookie break del login si frontend/backend en distintos dominios (CORS) | Asegurar que FRONTEND_URL esté correctamente configurado y CORS permita credenciales. El backend ya tiene `credentials: true` en cors. |
| Whitelist de campos puede omitir un campo necesario | Test de integración por cada endpoint modificado. El error de campo faltante se detecta como 400. |
| bcrypt@6.0.0 rompe API existente | bcrypt@6 cambió a ES modules. Verificar que `require('bcrypt')` sigue funcionando en Node.js 20. Si no, mantener 5.1.1 con overrides para tar. |
| Override de uuid puede romper Sequelize internamente | Sequelize@6 depende de uuid@8.3.2. uuid@11.1.1 tiene API compatible hacia atrás. Verificar con tests después del override. |
| CI/CD pipeline ralentiza el desarrollo en etapas tempranas | Solo bloquear en push a main/develop. Branches de feature no ejecutan suite completa. |
