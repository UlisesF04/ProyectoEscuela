## Context

El sistema carecía de un canal interno para que docentes y preceptores presenten documentación de licencias. El módulo implementado (`licences`) resuelve esto con una interfaz simple de carga de título + archivo adjunto opcional. El scope fue deliberadamente acotado: no incluye flujo de aprobación/rechazo — la administración visualiza las presentaciones, pero la resolución ocurre fuera del sistema.

Stack: Express 4 + Sequelize 6 (PostgreSQL) en backend; React 18 + Chakra UI en frontend. Multer gestiona la recepción del archivo en memoria antes de persistirlo como BLOB en la base de datos.

## Goals / Non-Goals

**Goals:**
- Permitir a docentes y preceptores registrar una licencia con título y archivo adjunto opcional
- Dar a los administradores visibilidad de todas las presentaciones
- Dar a los preceptores acceso a las licencias presentadas por padres (`from-parents`)
- Permitir descargar el archivo adjunto desde el sistema

**Non-Goals:**
- Flujo de aprobación / rechazo de licencias
- Cálculo de días de licencia consumidos
- Tipos de licencia categorizados (enfermedad, personal, etc.)
- Notificaciones automáticas al admin cuando se presenta una licencia
- Migración formal Sequelize (tabla creada por auto-sync)

## Decisions

**1. Almacenamiento del archivo como BLOB en la base de datos**
- Alternativa considerada: sistema de archivos local o servicio de almacenamiento externo (S3, Cloudinary)
- Decisión: BLOB en BD para simplificar el deploy (sin dependencia de storage externo), acceptable dado el tamaño máximo de 10 MB y la frecuencia baja de carga
- Trade-off: no escala bien si el volumen de archivos crece significativamente

**2. Un solo modelo `Licence` para docentes y preceptores**
- Alternativa considerada: modelos separados por rol
- Decisión: modelo unificado con FK a `users` — el rol del usuario determina los permisos de visibilidad. Simplicidad > granularidad innecesaria

**3. Nomenclatura `licences` en vez de `teacher-leaves`**
- Decisión: nombre más genérico para abarcar también a preceptores, que también pueden presentar licencias. El módulo atiende a cualquier usuario con rol docente o preceptor

**4. Sin migración formal**
- Decisión: tabla creada por Sequelize `sync({ alter: true })` en `app.js`. Aceptable para el sprint actual; deberá convertirse en migración formal en C-12 (devops)

## Risks / Trade-offs

- **BLOB en BD crece con el tiempo** → Migrar a storage externo si el volumen lo justifica (C-12 puede incluir este assessment)
- **Sin validación de rol en `from-parents`** → Verificar que el endpoint valida que el solicitante es preceptor
- **Sin migración formal** → Si se necesita resetear la BD en otro entorno, la tabla se crea sola pero sin historial de versiones. Pendiente para C-12
