# ProyectoEscuela

Sistema modular para el registro de inasistencias escolares y notificación automática a padres/tutores por WhatsApp.

## Descripción

Este proyecto es una solución integral donde los empleados de una escuela cargan las inasistencias diarias de los estudiantes a través de una app web. Un agente automatizado lee las ausencias y notifica automáticamente a los padres vía WhatsApp.

---

## 🛠 Tecnologías empleadas

- **Frontend:** React.js, Chakra UI o Material-UI, React Router, Context API.
- **Backend:** Node.js, Express.js, Mongoose (MongoDB), JWT para autenticación.
- **Base de datos:** MongoDB (MongoDB Atlas recomendado para despliegue cloud).
- **Agente automatizado:** Python, Pandas, Schedule o CRON, Twilio para WhatsApp.
- **Infraestructura:** Vercel (frontend), Render o Heroku (backend), GitHub.

---

## 🧩 Estructura Modular del Proyecto

```
/ProyectoEscuela
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/           # Integración con APIs externas
│       ├── hooks/              # Lógica reutilizable
│       └── App.jsx
│
├── backend/
│   ├── modules/
│   │   ├── auth/
│   │   ├── absences/
│   │   └── students/
│   ├── utils/
│   ├── services/
│   └── app.js
│
├── agent/
│   ├── tasks/
│   │   ├── db_reader.py        # Leer datos con Pandas
│   │   ├── notifier.py         # Notificar con WhatsApp
│   ├── scheduler/              # Tareas recurrentes
│   └── main.py
│
├── database/
│   ├── migrations/
│   └── seed.js                 # (Opcional) Datos iniciales
│
├── .env                        # Configuraciones de entorno
└── README.md
```

---

## 📦 Plan de Desarrollo (6 semanas)

### Semana 1: Diseño y Setup
- Prototipo en Figma (interfaz y flujo de usuario)
- Setup ambiente: frontend, backend, base de datos, agente Python, y repositorio GitHub
- Estructura de carpetas modular desde el inicio

### Semana 2: Backend
- API RESTful con Node.js/Express.js
- Modelos y rutas para empleados, estudiantes, inasistencias
- Autenticación con JWT, conexión a MongoDB
- Modularización completa

### Semana 3: Frontend
- Interfaz React conectada al backend
- Formularios y tablas para carga de datos y visualización
- Manejo de rutas y autenticación
- Uso de Context API y separación en componentes/servicios/hooks

### Semana 4: Agente Automatizado
- Script Python con Pandas para leer inasistencias
- Integración Twilio para enviar WhatsApp
- Automatización de consultas/notificaciones (Schedule/CRON)
- Modularidad para agregar funciones future

### Semana 5: Pruebas y Documentación
- Pruebas completas (carga, flujo de datos, notificaciones)
- Revisión y solución de bugs
- Documentación técnica y manual de usuario

### Semana 6: Despliegue y Capacitación
- Despliegue en producción (frontend, backend, base de datos, agente)
- .env para secretos
- Capacitación a empleados

---

## 🚀 Consideraciones
- El sistema es completamente modular, para permitir el fácil agregado de nuevas funciones o servicios
- MongoDB como base central para Node y Python
- Mantenibilidad y escalabilidad son prioridad
- Seguridad: JWT, HTTPS, validación estricta
- Control de versiones en GitHub

Cualquier duda o sugerencia para adaptar el plan o stack, ¡abrir un issue!
