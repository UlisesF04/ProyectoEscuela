## ADDED Requirements

### Requirement: Docente o preceptor puede presentar documentación de licencia
El sistema SHALL permitir a usuarios con rol `docente` o `preceptor` crear una presentación de licencia con un título descriptivo y un archivo adjunto opcional (JPG, PNG o PDF, máximo 10 MB).

#### Scenario: Presentación exitosa sin archivo
- **WHEN** un docente envía `POST /api/v1/licences` con título válido y sin archivo
- **THEN** el sistema crea el registro y devuelve HTTP 201 con los datos de la licencia creada

#### Scenario: Presentación exitosa con archivo adjunto
- **WHEN** un docente envía `POST /api/v1/licences` con título y archivo válido (≤ 10 MB)
- **THEN** el sistema persiste el archivo como BLOB y devuelve HTTP 201

#### Scenario: Archivo supera el límite de tamaño
- **WHEN** un docente envía un archivo mayor a 10 MB
- **THEN** el sistema rechaza la solicitud con HTTP 400

#### Scenario: Usuario sin rol autorizado intenta crear licencia
- **WHEN** un usuario con rol `admin` o `padre` envía `POST /api/v1/licences`
- **THEN** el sistema rechaza la solicitud con HTTP 403

### Requirement: Docente o preceptor puede consultar su historial de licencias
El sistema SHALL permitir al usuario autenticado consultar todas sus propias presentaciones de licencia ordenadas por fecha de creación descendente.

#### Scenario: Consulta con historial existente
- **WHEN** un docente autenticado envía `GET /api/v1/licences/me`
- **THEN** el sistema devuelve HTTP 200 con el listado de sus licencias (puede ser vacío)

#### Scenario: Consulta sin presentaciones previas
- **WHEN** un docente no ha presentado ninguna licencia
- **THEN** el sistema devuelve HTTP 200 con array vacío

### Requirement: Administrador puede ver todas las licencias del sistema
El sistema SHALL permitir a usuarios con rol `admin` consultar la totalidad de presentaciones de licencia de todos los usuarios.

#### Scenario: Admin consulta todas las licencias
- **WHEN** un admin autenticado envía `GET /api/v1/licences/admin`
- **THEN** el sistema devuelve HTTP 200 con todas las licencias, incluyendo datos del usuario presentante

#### Scenario: Usuario no-admin intenta acceder al listado de admin
- **WHEN** un usuario con rol `docente` envía `GET /api/v1/licences/admin`
- **THEN** el sistema rechaza con HTTP 403

### Requirement: Preceptor puede ver licencias presentadas por padres
El sistema SHALL permitir a usuarios con rol `preceptor` consultar las licencias presentadas por usuarios con rol `padre`.

#### Scenario: Preceptor consulta licencias de padres
- **WHEN** un preceptor autenticado envía `GET /api/v1/licences/from-parents`
- **THEN** el sistema devuelve HTTP 200 con las licencias de usuarios padre

### Requirement: Usuario puede descargar el archivo adjunto de una licencia
El sistema SHALL permitir al propietario de la licencia o a un admin descargar el archivo adjunto.

#### Scenario: Descarga exitosa de archivo
- **WHEN** el propietario o un admin envía `GET /api/v1/licences/:id/download`
- **THEN** el sistema devuelve el archivo con el Content-Type y nombre de archivo originales

#### Scenario: Licencia sin archivo adjunto
- **WHEN** se solicita la descarga de una licencia sin archivo
- **THEN** el sistema devuelve HTTP 404
