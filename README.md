# ProyectoEscuela

Sistema modular para el registro de inasistencias escolares y notificación automática a padres/tutores por WhatsApp.

## Descripción

Este proyecto es una solución integral donde los empleados de una escuela cargan las inasistencias diarias de los estudiantes a través de una app web. Un agente automatizado lee las ausencias y notifica automáticamente a los padres vía WhatsApp.

---

## 🛠 Tecnologías empleadas

- **Frontend:** React.js, Chakra UI, React Router, Context API, Vite.
- **Backend:** Node.js, Express.js, Sequelize ORM, PostgreSQL, JWT para autenticación.
- **Base de datos:** PostgreSQL (Railway o Render recomendados para despliegue cloud).
- **Agente automatizado:** Python, Pandas, Schedule o CRON, Twilio para WhatsApp.
- **Infraestructura:** Vercel (frontend), Railway o Render (backend), GitHub.

---

## 🧩 Estructura Modular del Proyecto

```
/ProyectoEscuela
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   └── Login.jsx
│   │   ├── services/           # Integración con APIs externas
│   │   ├── hooks/              # Lógica reutilizable
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .gitignore
│
├── backend/
│   ├── config/
│   │   └── database.js         # Conexión a PostgreSQL con Sequelize
│   ├── modules/
│   │   ├── auth/
│   │   ├── absences/
│   │   └── students/
│   ├── utils/
│   ├── services/
│   ├── app.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
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
├── .gitignore
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
- Autenticación con JWT, conexión a PostgreSQL con Sequelize
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
- PostgreSQL como base de datos central para Node y Python
- Mantenibilidad y escalabilidad son prioridad
- Seguridad: JWT, HTTPS, validación estricta
- Control de versiones en GitHub

---

## 🗄️ Configuración de Base de Datos

### PostgreSQL (Local)

1. **Instalar PostgreSQL:**
   - Windows: Descargar desde https://www.postgresql.org/download/windows/
   - Seguir el instalador

2. **Crear base de datos:**
   ```bash
   psql -U postgres
   CREATE DATABASE proyecto_escuela;
   ```

3. **Configurar variables de entorno en `backend/.env`:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=proyecto_escuela
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña
   PORT=5000
   JWT_SECRET=tu_clave_secreta
   ```

4. **Instalar dependencias del backend:**
   ```bash
   cd backend
   npm install
   ```

5. **Iniciar servidor:**
   ```bash
   npm run dev
   ```

### PostgreSQL en la Nube (Railway/Render)

Para despliegue en producción, usa Railway o Render:
- **Railway:** https://railway.app
- **Render:** https://render.com

Ambas plataformas ofrecen PostgreSQL gratuito y fácil integración.

Cualquier duda o sugerencia para adaptar el plan o stack, ¡abrir un issue!
