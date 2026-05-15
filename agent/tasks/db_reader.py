# db_reader.py
# Lector de base de datos PostgreSQL para el agente de notificaciones.
# Consulta las tablas compartidas con el backend Node.js para evaluar
# condiciones de alerta (RN-01 a RN-07).
#
# Conexión vía psycopg2 con pool reutilizable (ver agent/db.py).
# Cada función retorna datos estructurados para que notifier.py
# determine si debe enviar una alerta.

# --- Funciones a implementar (CHANGE-014) ---
#
# consultar_inasistencias_mes(estudiante_id, mes, anio)
#   → total_inasistencias: int
#   → RN-01: notificar si >= 3
#
# consultar_porcentaje_anual(estudiante_id, anio)
#   → porcentaje: float
#   → RN-02: notificar si > 20%
#
# consultar_notas_criticas(estudiante_id, periodo)
#   → notas: list[dict]  (materia, nota, fecha)
#   → RN-04: notificar si nota <= 4
#
# consultar_promedio_bajo(estudiante_id)
#   → promedio: float
#   → RN-05: notificar si promedio < 6
#
# consultar_tareas_pendientes(estudiante_id, materia)
#   → consecutivas_no_entregadas: int
#   → RN-06: notificar si >= 2
#
# consultar_licencias_docente(docente_id)
#   → disponibles: int, usados: int
#   → RN-07: notificar si disponibles <= 3
#
# consultar_ultima_notificacion(tipo, destinatario_id, evento_id)
#   → ultima_fecha: datetime | None
#   → RN-11: no enviar si ya se envió hoy
