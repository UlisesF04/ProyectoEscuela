## 1. Modelo y Base de Datos

- [x] 1.1 Crear modelo `Grade` en `backend/models/Grade.js` con `sequelize.define()` (tableName: `grades`, underscored, timestamps)
- [x] 1.2 Agregar asociaciones de `Grade` en `backend/models/index.js`: belongsTo(Student, Subject, User)
- [x] 1.3 Crear migración `20260526004-create-grades.js` con tabla `grades` + índices
- [x] 1.4 Crear repositorio `backend/repositories/gradeRepository.js`

## 2. Módulo Backend — Calificaciones

- [x] 2.1 Crear `backend/modules/grades/grades.service.js` con CRUD + verificación RN-04
- [x] 2.2 Crear `backend/modules/grades/grades.controller.js` con handlers async
- [x] 2.3 Crear `backend/modules/grades/grades.routes.js` con validaciones por ruta
- [x] 2.4 Registrar rutas en `backend/app.js`: `app.use('/api/v1/grades', gradesRoutes)`

## 3. Frontend

- [x] 3.1 Crear `frontend/src/services/gradesService.js` con métodos CRUD
- [x] 3.2 Integrar sección de calificaciones en `DocenteDashboard.jsx`

## 4. Tests _(pendiente)_

- [ ] 4.1 Tests de integración para grades
