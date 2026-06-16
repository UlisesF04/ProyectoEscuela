# 🎓 Sistema de Gestión Académica y Comunicación Escolar

## Presentación de Funcionalidades

> **Proyecto:** Optimización de la Gestión Académica y Comunicación Escolar
> **Demo:** Datos de prueba cargados — 3 cursos, 33 alumnos, 5 docentes
> **Fecha:** Junio 2026

---

## 📋 Índice

1. [Credenciales de Acceso](#1-credenciales-de-acceso)
2. [Estructura de Datos](#2-estructura-de-datos)
3. [Funcionalidades por Rol](#3-funcionalidades-por-rol)
   - [Admin — Panel de Control](#31-admin--panel-de-control)
   - [Preceptor — Gestión de Asistencias](#32-preceptor--gestión-de-asistencias)
   - [Docente — Notas y Evolución](#33-docente--notas-y-evolución)
   - [Padre — Portal Parental](#34-padre--portal-parental)
4. [Casos de Prueba](#4-casos-de-prueba)
5. [Sistema de Notificaciones](#5-sistema-de-notificaciones)
6. [Rutas de la API](#6-rutas-de-la-api)
7. [Capturas de Pantalla Sugeridas](#7-capturas-de-pantalla-sugeridas)

---

## 1. Credenciales de Acceso

Todas las contraseñas: **`password123`**

| Rol | Email | Nombre |
|-----|-------|--------|
| **Admin** | `admin@escuela.edu` | Admin Sistema |
| **Preceptor** | `preceptor@escuela.edu` | Carlos Rodríguez |
| **Docente — Matemática** | `docente.matematica@escuela.edu` | María López |
| **Docente — Lengua** | `docente.lengua@escuela.edu` | Juan Martínez |
| **Docente — Historia** | `docente.historia@escuela.edu` | Ana García |
| **Docente — Cs. Naturales** | `docente.csnaturales@escuela.edu` | Pedro Fernández |
| **Docente — Inglés** | `docente.ingles@escuela.edu` | Laura Díaz |
| **Padre de Thiago García** | `padre.garcia@escuela.edu` | Ricardo García |
| **Padre de Valentina López** | `padre.lopez@escuela.edu` | Silvina López |

> ℹ️ Hay **33 padres** (uno por alumno). El patrón de email es `padre.{apellido}@escuela.edu`.

---

## 2. Estructura de Datos

### Cursos

| Curso | Nivel | Año | Alumnos |
|-------|-------|:---:|:-------:|
| **1° A** | Secundaria | 2026 | 11 |
| **2° B** | Secundaria | 2026 | 11 |
| **3° C** | Secundaria | 2026 | 11 |

### Materias por Curso

Cada curso tiene **5 materias**, cada una dictada por un docente especializado:

| Curso | Matemática | Lengua y Lit. | Historia | Cs. Naturales | Inglés |
|:-----:|:----------:|:-------------:|:--------:|:-------------:|:------:|
| 1° A | María López | Juan Martínez | Ana García | Pedro Fernández | Laura Díaz |
| 2° B | María López | Juan Martínez | Ana García | Pedro Fernández | Laura Díaz |
| 3° C | María López | Juan Martínez | Ana García | Pedro Fernández | Laura Díaz |

### Alumnos por Curso

<details>
<summary><strong>1° A</strong> (11 alumnos)</summary>

| # | Apellido | Nombre | DNI |
|:-:|:--------:|:------:|:---:|
| 1 | García | Thiago | 45.123.456 |
| 2 | López | Valentina | 45.123.457 |
| 3 | Martínez | Benjamín | 45.123.458 |
| 4 | Rodríguez | Isabella | 45.123.459 |
| 5 | González | Santino | 45.123.460 |
| 6 | Pérez | Camila | 45.123.461 |
| 7 | Fernández | Mateo | 45.123.462 |
| 8 | Sánchez | Sofía | 45.123.463 |
| 9 | Romero | Joaquín | 45.123.464 |
| 10 | Díaz | Martina | 45.123.465 |
| 11 | Torres | Bautista | 45.123.466 |
</details>

<details>
<summary><strong>2° B</strong> (11 alumnos)</summary>

| # | Apellido | Nombre | DNI |
|:-:|:--------:|:------:|:---:|
| 12 | Álvarez | Catalina | 45.234.567 |
| 13 | Ruiz | Francisco | 45.234.568 |
| 14 | Silva | Emilia | 45.234.569 |
| 15 | Castro | Sebastián | 45.234.570 |
| 16 | Ortiz | Valentino | 45.234.571 |
| 17 | Medina | Juana | 45.234.572 |
| 18 | Herrera | Nicolás | 45.234.573 |
| 19 | Aguilar | Renata | 45.234.574 |
| 20 | Vargas | Felipe | 45.234.575 |
| 21 | Rivas | Antonella | 45.234.576 |
| 22 | Guerrero | Tomás | 45.234.577 |
</details>

<details>
<summary><strong>3° C</strong> (11 alumnos)</summary>

| # | Apellido | Nombre | DNI |
|:-:|:--------:|:------:|:---:|
| 23 | Morales | Isabella | 45.345.678 |
| 24 | Campos | Santiago | 45.345.679 |
| 25 | Vega | Luciana | 45.345.680 |
| 26 | Ríos | Maximiliano | 45.345.681 |
| 27 | Paredes | Valentina | 45.345.682 |
| 28 | Acosta | Lorenzo | 45.345.683 |
| 29 | Navarro | Fátima | 45.345.684 |
| 30 | Sosa | Bruno | 45.345.685 |
| 31 | Correa | Lourdes | 45.345.686 |
| 32 | Benítez | Ignacio | 45.345.687 |
| 33 | Mendoza | Pilar | 45.345.688 |
</details>

### Licencias Registradas

| Titular | Tipo |
|---------|------|
| Carlos Rodríguez (Preceptor) | Licencia personal — Trámites bancarios |
| María López (Docente) | Licencia por enfermedad — Gripe |
| Ana García (Docente) | Licencia por capacitación docente |
| Pedro Fernández (Docente) | Licencia por examen |

---

## 3. Funcionalidades por Rol

### 3.1 Admin — Panel de Control

**Ruta:** `/admin/dashboard`

El administrador tiene acceso completo al sistema:

| Funcionalidad | Ruta | Descripción |
|:-------------|:-----|:------------|
| **Dashboard** | `/admin/dashboard` | Estadísticas generales: alumnos, docentes, asistencias generales |
| **Usuarios** | `/admin/users` | CRUD de usuarios del sistema |
| **Cursos** | `/admin/courses` | Gestión de cursos y materias |
| **Alumnos** | `/admin/students` | Gestión de alumnos (alta/baja/modificación) |
| **Licencias** | `/admin/leaves` | Administración de licencias docentes |
| **Notificaciones** | `/admin/notifications` | Historial completo de alertas enviadas |
| **Configuración** | — | Umbral de ausencias, activación de notificaciones |

**Estadísticas disponibles en el Dashboard:**
- Total de alumnos (33)
- Total de docentes (5)
- Asistencia general del día
- Alumnos con ausencias críticas
- Notificaciones enviadas en el período
- Gráficos de evolución

---

### 3.2 Preceptor — Gestión de Asistencias

**Ruta:** `/preceptor/attendance`

El preceptor registra la asistencia diaria de todos los cursos.

| Funcionalidad | Descripción |
|:-------------|:------------|
| **Registro diario** | Marcar presente/ausente/tarde por alumno |
| **Carga por lote** | Registrar todo un curso de una sola vez |
| **Justificación** | Marcar ausencias como justificadas con nota |
| **Historial** | Ver asistencias anteriores por alumno |

**Datos cargados:**
- ✅ **73 días lectivos** registrados (marzo - 10 junio 2026)
- ✅ **2.409 registros** de asistencia en total
- ✅ **Asistencias del día de HOY** (10 de junio) ya cargadas por el preceptor
- ✅ Alumnos con perfil de ausencias variado (ver Casos de Prueba)
- ✅ Justificaciones reales con notas como "Certificado médico adjunto", "Control odontológico", etc.

---

### 3.3 Docente — Notas y Evolución

**Rutas:**
- Carga de notas: `/docente/grades`
- Evolución: `/docente/evolution`

| Funcionalidad | Descripción |
|:-------------|:------------|
| **Cargar notas** | Registrar calificaciones por alumno y materia |
| **Tipos de nota** | Examen, Trabajo práctico, Tarea, Oral, Otro |
| **Evolución** | Gráfico de evolución del rendimiento del alumno |
| **Promedios** | Vista de promedios por curso y materia |

**Datos cargados:**
- ✅ **495 notas** registradas en total
- ✅ Cada alumno tiene **15-18 notas** distribuidas en las 5 materias (2-4 notas por materia)
- ✅ Suficientes notas para ver **evolución temporal** por materia en los gráficos
- ✅ Docentes asignados a sus materias correspondientes
- ✅ Alumnos con bajo rendimiento para probar alertas (ver Casos de Prueba)

> **Ejemplo:** María López (docente.matematica@escuela.edu) puede ver y cargar notas de Matemática en los 3 cursos (1° A, 2° B, 3° C).

---

### 3.4 Padre — Portal Parental

**Rutas:**
- Dashboard: `/padre/dashboard`
- Evolución: `/padre/evolution`
- Justificativos: `/padre/justificativos`

| Funcionalidad | Descripción |
|:-------------|:------------|
| **Dashboard** | Resumen de sus hijos: últimas notas, asistencias, alertas |
| **Evolución** | Gráficos de rendimiento por materia |
| **Inasistencias** | Ver faltas de sus hijos, justificadas y no |
| **Justificar** | Cargar justificaciones de inasistencias |

> **Ejemplo:** `padre.garcia@escuela.edu` (Ricardo García) puede ver los datos de **Thiago García** (1° A).

---

## 4. Casos de Prueba

### 🔴 Caso 1: Alumno con muchas faltas injustificadas

**Santino González** (1° A) — `student_id: 5`

| Indicador | Valor |
|:----------|:-----:|
| Ausencias injustificadas | **26** (de 73 días) |
| Promedio general | **5.00** (el más bajo del curso) |

**Alertas generadas:**
- ✅ "Santino González acumula 12 faltas injustificadas. Se requiere contacto urgente con el tutor."
- ✅ "Santino González obtuvo 3.50 en Matemática. Se recomienda apoyo escolar."

**Qué probar:**
- Iniciar sesión como `preceptor@escuela.edu` → ver asistencias de Santino
- Iniciar sesión como `admin@escuela.edu` → ver notificaciones enviadas
- Iniciar sesión como `padre.gonzalez@escuela.edu` (Marcelo González) → ver dashboard del hijo

---

### 🟡 Caso 2: Alumnos con faltas justificadas

**Isabella Rodríguez** (1° A) — `student_id: 4`

| Indicador | Valor |
|:----------|:-----:|
| Ausencias justificadas | **12** |
| Ausencias totales | **17** |
| % Justificadas | **70%** |

**Thiago García** (1° A) — `student_id: 1`

| Indicador | Valor |
|:----------|:-----:|
| Ausencias justificadas | **12** |
| Ausencias totales | **16** |
| % Justificadas | **75%** |

**Valentina López** (1° A) — `student_id: 2`

| Indicador | Valor |
|:----------|:-----:|
| Ausencias justificadas | **12** |
| Ausencias totales | **20** |
| % Justificadas | **60%** |

**Notas de justificación reales (ejemplos):**
> "Falta por consulta médica — Dr. Rodríguez (Clínica San José) — Justificado por Ricardo."
> "Inasistencia por enfermedad — Certificado del pediatra. — Justificado por Ricardo."
> "Control odontológico de urgencia. Se adjunta certificado. — Justificado por Silvina."

**Qué probar:**
- Ver en el listado de asistencias que las faltas aparecen como "Justificadas" con nota
- Iniciar sesión como `padre.rodriguez@escuela.edu` (Carolina Rodríguez) → ver inasistencias de Isabella
- Iniciar sesión como `padre.garcia@escuela.edu` (Ricardo García) → ver inasistencias de Thiago

---

### 🟠 Caso 3: Alumno con bajo rendimiento general

**Bruno Sosa** (3° C) — `student_id: 30`

| Indicador | Valor |
|:----------|:-----:|
| Ausencias injustificadas | **12** |
| Promedio bajo en todas las materias | **Sí** |
| Alertas generadas | Ausencias críticas + Nota baja |

**Qué probar:**
- Iniciar sesión como `docente.csnaturales@escuela.edu` (Pedro Fernández) → cargar/ver notas de Bruno en Cs. Naturales
- Ver la evolución de notas de Bruno en `/docente/evolution` o `/padre/evolution`

---

### 🟢 Caso 4: Alumno con asistencia irregular (tardes + ausencias)

**Joaquín Romero** (1° A) — `student_id: 9`

| Indicador | Valor |
|:----------|:-----:|
| % Asistencia | **60.0%** (más tardes del curso) |
| Ausencias injustificadas | **3** |
| Tardes registradas | Múltiples |

**Qué probar:**
- Ver patrón de tardes en el registro de asistencias del preceptor

---

### 🔵 Caso 5: Alumno destacado (altas calificaciones)

**Martina Díaz** (1° A) — `student_id: 10`

| Indicador | Valor |
|:----------|:-----:|
| Promedio general | **8.42** (el más alto del curso) |
| Asistencia | Regular |

**Qué probar:**
- Ver evolución de notas
- Comparar gráficos entre Martina y Santino en `/docente/evolution`

---

## 5. Sistema de Notificaciones

### Alertas Cargadas en la Demo

| # | Tipo | Alumno | Mensaje |
|:-:|:----:|:------:|:--------|
| 1 | 🚨 Ausencia crítica | Santino González | 12 faltas injustificadas — contacto urgente |
| 2 | 🚨 Ausencia crítica | Valentino Ortiz | 10 faltas injustificadas — notificar tutor |
| 3 | 🚨 Ausencia crítica | Bruno Sosa | 8 faltas injustificadas — riesgo de regularidad |
| 4 | 📉 Nota baja | Santino González | 3.50 en Matemática — apoyo escolar |
| 5 | 📉 Nota baja | Benjamín Martínez | 2.00 en Lengua — riesgo de desaprobación |
| 6 | 📉 Nota baja | Bruno Sosa | Promedio 3.20 en Matemática — bajo rendimiento |
| 7 | 📉 Nota baja | Francisco Ruiz | 3.00 en Cs. Naturales — requiere atención |
| 8 | ⚠️ Prevención | Sofía Sánchez | 6 faltas — umbral próximo |

### Cómo Probar el Bot de Notificaciones

```bash
# Ejecución manual inmediata
cd agent
python main.py --now

# Trigger vía API
curl -X POST http://localhost:5000/api/v1/notifications/trigger \
  -H "Authorization: Bearer sk-tu-service-api-key"
```

El bot evalúa:
- **Ausencias críticas:** ≥ X faltas sin justificar (configurable en `ausencia_umbral`)
- **Riesgo de regularidad:** ≥ 20% de inasistencias
- **Calificación baja:** Nota < 4
- **Vencimiento de licencia:** Licencia docente vence en ≤ 3 días

---

## 6. Rutas de la API

### Autenticación

| Método | Ruta | Descripción |
|:------:|:-----|:------------|
| POST | `/api/v1/auth/login` | Iniciar sesión |
| POST | `/api/v1/auth/logout` | Cerrar sesión |
| GET | `/api/v1/auth/me` | Datos del usuario actual |
| PUT | `/api/v1/auth/password` | Cambiar contraseña |

### Admin

| Método | Ruta | Descripción |
|:------:|:-----|:------------|
| GET | `/api/v1/admin/stats` | Estadísticas del dashboard |
| POST | `/api/v1/admin/stats/page-visit` | Registrar visita a página |
| GET/PUT | `/api/v1/config` | Configuración del sistema |
| GET/POST | `/api/v1/users` | Gestión de usuarios |

### Académico

| Método | Ruta | Descripción |
|:------:|:-----|:------------|
| GET/POST | `/api/v1/courses` | Cursos |
| GET/POST | `/api/v1/students` | Alumnos |
| POST | `/api/v1/attendances` | Registrar asistencia individual |
| POST | `/api/v1/attendances/batch` | Registrar asistencia por lote |
| PUT | `/api/v1/attendances/:id` | Actualizar asistencia |
| PUT | `/api/v1/attendances/:id/justify` | Justificar inasistencia |
| POST | `/api/v1/grades` | Cargar nota |
| GET | `/api/v1/students/:id/evolution` | Evolución de notas del alumno |

### Notificaciones y Licencias

| Método | Ruta | Descripción |
|:------:|:-----|:------------|
| GET | `/api/v1/notifications` | Historial de notificaciones |
| POST | `/api/v1/notifications/trigger` | Trigger manual del bot |
| GET/POST | `/api/v1/licences` | Licencias docentes |

---

## 7. Capturas de Pantalla Sugeridas

Para una presentación completa, recomiendo capturar:

1. **Login** — Pantalla de inicio de sesión
2. **Admin Dashboard** — Estadísticas generales
3. **Admin → Usuarios** — Listado de usuarios del sistema
4. **Admin → Notificaciones** — Historial de alertas enviadas
5. **Preceptor → Asistencias** — Registro diario con el curso 1° A
6. **Preceptor → Asistencias** — Detalle de Santino González con ausencias
7. **Docente → Notas** — Carga de notas para Matemática en 1° A
8. **Docente → Evolución** — Gráfico comparativo Santino vs Martina
9. **Padre → Dashboard** — Resumen del hijo (Thiago García)
10. **Padre → Evolución** — Gráficos de rendimiento por materia
11. **Padre → Inasistencias** — Faltas con opción de justificar

---

## Comando Rápido para Recargar la Demo

```bash
cd backend
node scripts/seed-demo.js
```

Esto **limpia todos los datos** y los regenera desde cero con los mismos valores.

---

> **Documentación completa del proyecto:** [`GUIA-INSTALACION.md`](./GUIA-INSTALACION.md)
> **Roadmap de implementación:** [`CHANGES.md`](./CHANGES.md)
> **Knowledge base:** [`knowledge-base/`](./knowledge-base/)
