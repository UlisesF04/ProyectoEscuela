## 1. Modelo y Base de Datos

- [ ] 1.1 Crear modelo `Attendance` en `backend/models/Attendance.js` con `sequelize.define()` (tableName: `attendances`, underscored, timestamps)
- [ ] 1.2 Agregar asociaciones de `Attendance` en `backend/models/index.js`: belongsTo(Student), belongsTo(User como registered_by)
- [ ] 1.3 Crear migración `20260526003-create-attendances.js` con tabla `attendances` + índices UNIQUE(student_id, date), INDEX(date), INDEX(status), INDEX(is_justified)
- [ ] 1.4 Crear repositorio `backend/repositories/attendanceRepository.js` con métodos: findById, findAll, create, update, findByStudentAndDate, findByStudentId, getSummaryByStudentId

## 2. Módulo Backend — Asistencias

- [ ] 2.1 Crear `backend/modules/attendances/attendances.service.js` con:
  - `register(data)`: valida unicidad student_id+date (RN-05), crea registro con `registered_by = req.user.id`
  - `update(id, data)`: edita estado de asistencia (solo preceptor/admin, RN-06)
  - `justify(id, justificationData)`: marca is_justified=true + justification_note, irreversible (RN-07)
  - `getStudentHistory(studentId, filters)`: devuelve registros + resumen de totales (RN-09)
  - `uploadCertificate(attendanceId, file)`: valida tipo/tamaño (RN-08), guarda archivo, asocia URL

- [ ] 2.2 Crear `backend/modules/attendances/attendances.controller.js` con handlers async (req, res, next) y try/catch + next(error)

- [ ] 2.3 Crear `backend/modules/attendances/attendances.routes.js` con:
  - `POST /` → auth + role('preceptor','admin') + validation → create
  - `POST /batch` → auth + role('preceptor','admin') + validation → batchCreate
  - `PUT /:id` → auth + role('preceptor','admin') + validation → update
  - `PUT /:id/justify` → auth + role('preceptor','admin') + validation → justify
  - `POST /certificates/upload` → auth + role('preceptor','admin','padre') + multer → uploadCertificate

- [ ] 2.4 Registrar rutas en `backend/app.js`: `app.use('/api/v1/attendances', attendancesRoutes)`
- [ ] 2.5 Crear middleware `getAttendanceHistory` con permisos granulares en rutas GET: preceptor/admin ven todo, docente ve alumnos de su materia, padre ve solo hijos vinculados (RN-03)

## 3. Subida de Certificados

- [ ] 3.1 Instalar `multer` como dependencia y configurar almacenamiento en `uploads/certificates/`
- [ ] 3.2 Implementar validación de tipo MIME (JPG/PNG/PDF) y tamaño (≤ 5MB) en el middleware multer + en service (RN-08)
- [ ] 3.3 Agregar variable `UPLOAD_DIR` al `.env` y `backend/config/` con valor por defecto `uploads/certificates`

## 4. Frontend — PreceptorDashboard

- [ ] 4.1 Crear `frontend/src/services/attendanceService.js` con métodos: register, batchRegister, update, justify, getStudentHistory, uploadCertificate
- [ ] 4.2 Crear `frontend/src/components/AttendanceGrid.jsx`: grilla de alumnos con checkboxes (presente/ausente/tarde), selector de curso+fecha, resumen de totales
- [ ] 4.3 Crear `frontend/src/pages/PreceptorDashboard.jsx` con:
  - Selector de curso (carga GET /api/v1/courses)
  - Selector de fecha (default: hoy)
  - AttendanceGrid con alumnos del curso seleccionado
  - Botón "Guardar todo" → batch register
  - Resumen de totales por alumno
  - Carga de certificados (modal con file input)

- [ ] 4.4 Crear `frontend/src/pages/DocenteDashboard.jsx` con sección de consulta de asistencias (solo lectura)

- [ ] 4.5 Actualizar `AppRoutes.jsx`: ruta `/preceptor` → PreceptorDashboard, ruta `/docente` → DocenteDashboard (reemplazar placeholders)

## 5. Tests

- [ ] 5.1 Crear `backend/tests/attendance.test.js` con:
  - Registro exitoso de asistencia (POST /api/v1/attendances)
  - Registro duplicado → HTTP 409 (RN-05)
  - Edición de estado → HTTP 200
  - Justificación irreversible → HTTP 200 + segundo intento 409 (RN-07)
  - Subida de certificado válido → HTTP 200
  - Subida de archivo inválido → HTTP 400 (RN-08)
  - Historial con resumen de totales (RN-09)
  - Permisos: preceptor OK, admin OK, docente 403 en escritura, padre 403 en escritura
  - 401 sin token en todos los endpoints

- [ ] 5.2 Verificar que `npm test` pase con los nuevos tests (models + auth + admin + attendance)

## 6. Limpieza

- [ ] 6.1 Eliminar directorio `backend/modules/absences/` (reemplazado por `modules/attendances/`)
- [ ] 6.2 Agregar archivo `.gitkeep` en `uploads/certificates/` para versionar el directorio
