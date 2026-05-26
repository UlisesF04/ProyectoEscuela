# Database Configuration

> Configuración de conexión a PostgreSQL mediante Sequelize con soporte para variables de entorno individuales y DATABASE_URL.

## ADDED Requirements

### Requirement: Database connection config
The backend SHALL have a `config/database.js` file that exports a Sequelize instance configured via environment variables.

#### Scenario: Connection uses DATABASE_URL when available
- **WHEN** `DATABASE_URL` environment variable is set
- **THEN** the Sequelize instance SHALL use `DATABASE_URL` as the connection string

#### Scenario: Connection falls back to individual variables
- **WHEN** `DATABASE_URL` is not set
- **THEN** the Sequelize instance SHALL use `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_PORT` individually

#### Scenario: Default values for development
- **WHEN** no environment variables are set
- **THEN** `DB_HOST` SHALL default to `localhost`, `DB_PORT` to `5432`, `DB_NAME` to `proyecto_escuela`, `DB_USER` to `postgres`

### Requirement: Development credentials
The local development database SHALL use the name `proyecto_escuela` with user `postgres` and password `root` as configured in `backend/.env`.

#### Scenario: Local .env contains development credentials
- **WHEN** reading `backend/.env`
- **THEN** `DB_NAME` SHALL be `proyecto_escuela`, `DB_USER` SHALL be `postgres`, `DB_PASSWORD` SHALL be `root`

### Requirement: Database dialect
The Sequelize instance SHALL use `postgres` as the dialect.

#### Scenario: Dialect is postgres
- **WHEN** inspecting the Sequelize instantiation
- **THEN** the dialect SHALL be set to `'postgres'`

### Requirement: Connection pooling
The Sequelize instance SHALL configure connection pooling with a maximum of 5 connections and a minimum of 0.

#### Scenario: Pool config exists
- **WHEN** inspecting the Sequelize configuration
- **THEN** `pool.max` SHALL be 5 and `pool.min` SHALL be 0
