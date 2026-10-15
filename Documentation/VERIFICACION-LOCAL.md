# Verificación del entorno local

Fecha: 2026-10-06. Alcance: Docker local, actualización de dependencias y documentación de C-12.

| Comprobación | Resultado |
|---|---|
| `npm audit` backend | 0 vulnerabilidades reportadas; antes: 9 |
| `npm audit` frontend | 0 vulnerabilidades reportadas; antes: 12 |
| Instalación reproducible | `npm ci` en el frontend y durante los builds de las imágenes Docker |
| Build frontend | Vite 8: correcto |
| Docker Compose | Backend y PostgreSQL 15: healthy |
| Suites backend | 326 comprobaciones aprobadas en 8 suites, sobre PostgreSQL real en un contenedor aislado |
| Bootstrap | Tablas, cuentas, vínculos y notas creados; inicialización repetida/concurrente conserva datos y contraseñas |
| Persistencia | Documento subido por HTTP y archivo en el volumen sobreviven a `down` / `up` |
| Sesión | Cookie de autenticación válida después de recrear los contenedores |
| Familias | Consulta del hijo vinculado, 2 materias y 6 notas |
| Navegador | Inicio de sesión por teclado y routing para admin, preceptor, docente y padre |
| Responsive | Evolución parental comprobada a 390 × 844, sin overflow horizontal de la página |
| Imagen | Proceso no-root; archivos `.env` locales excluidos del contexto |

El checklist de frontend se aplicó al alcance de la actualización: labels accesibles del login, interacción por teclado, navegación por rol de C-13, sesión con cookies, carga de datos, responsive del flujo parental y build. La comprobación de navegador utilizó Microsoft Edge en modo headless.

Vite informa un aviso de tamaño del bundle principal (837 kB minificado). El build finaliza correctamente.

Los comandos reproducibles de auditoría, build y tests están en el [README raíz](../README.md#verificación). `compose.test.yaml` usa almacenamiento temporal y un proyecto Compose distinto al de desarrollo.

El despliegue cloud y la finalización del historial de migraciones siguen pendientes dentro del alcance original de C-12; el arranque local utiliza el inicializador de modelos y el bootstrap transaccional documentados.
