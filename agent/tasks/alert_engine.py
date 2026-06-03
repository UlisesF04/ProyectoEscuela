import logging

import psycopg2

from tasks.db_reader import DbReader
from tasks.notifier import Notifier

logger = logging.getLogger(__name__)

ALERT_TYPES = {
    "AUSENCIAS_CRITICAS": "ausencias_criticas",
    "RIESGO_REGULARIDAD": "riesgo_regularidad",
    "CALIFICACION_BAJA": "calificacion_baja",
    "TAREA_PENDIENTE": "tarea_pendiente",
    "LICENCIA_VENCIMIENTO": "licencia_vencimiento",
}


def was_already_notified(conn, student_id: int | None, alert_type: str) -> bool:
    if student_id is None:
        return False
    query = """
        SELECT COUNT(*) FROM notification_logs
        WHERE student_id = %s AND type = %s
          AND sent_at > NOW() - INTERVAL '24 hours'
    """
    try:
        with conn.cursor() as cur:
            cur.execute(query, (student_id, alert_type))
            count = cur.fetchone()[0]
            return count > 0
    except Exception as e:
        logger.error("Error en anti-spam check: %s", e)
        return False


def _insert_notification_log(conn, recipient_id, student_id, alert_type, message, status):
    query = """
        INSERT INTO notification_logs
            (recipient_id, student_id, type, message, channel, status, sent_at)
        VALUES (%s, %s, %s, %s, 'email', %s, NOW())
    """
    try:
        with conn.cursor() as cur:
            cur.execute(query, (recipient_id, student_id, alert_type, message, status))
        conn.commit()
    except Exception as e:
        logger.error("Error insertando en notification_logs: %s", e)
        conn.rollback()


class AlertEngine:
    def __init__(
        self,
        database_url: str,
        resend_api_key: str,
        from_email: str,
        ausencia_umbral: int,
    ):
        self.database_url = database_url
        self.resend_api_key = resend_api_key
        self.from_email = from_email
        self.ausencia_umbral = ausencia_umbral

        self.db_reader: DbReader | None = None
        self.notifier: Notifier | None = None

    def _get_umbral_from_db(self) -> int:
        try:
            if self.db_reader is None:
                return self.ausencia_umbral
            raw = self.db_reader.get_setting("absence_threshold")
            if raw is not None:
                return int(raw)
        except Exception as e:
            logger.warning("Error leyendo absence_threshold de DB, usando fallback: %s", e)
        return self.ausencia_umbral

    def run(self) -> None:
        logger.info("=== AlertEngine: Iniciando ciclo de evaluacion ===")

        try:
            self.db_reader = DbReader(self.database_url)
        except Exception as e:
            logger.error("No se pudo conectar a la BD (error de conexion oculto por seguridad)")
            logger.debug("Detalles: %s", type(e).__name__)
            return

        self.notifier = Notifier(self.resend_api_key, self.from_email)

        conn = self.db_reader.conn

        stats = {"sent": 0, "failed": 0, "skipped": 0}

        stats = self._eval_ausencias_criticas(conn, stats)
        stats = self._eval_riesgo_regularidad(conn, stats)
        stats = self._eval_calificaciones_bajas(conn, stats)
        stats = self._eval_tareas_pendientes(conn, stats)
        stats = self._eval_licencias_vencimiento(conn, stats)

        logger.info(
            "=== AlertEngine: Ciclo completado. "
            "Alertas: %d enviadas, %d fallidas, %d saltadas (anti-spam) ===",
            stats["sent"], stats["failed"], stats["skipped"],
        )

        self.db_reader.close()

    def _eval_ausencias_criticas(self, conn, stats: dict) -> dict:
        try:
            umbral = self._get_umbral_from_db()
            alerts = self.db_reader.get_ausencias_criticas(umbral)
        except Exception as e:
            logger.error("Error evaluando AUSENCIAS_CRITICAS: %s", e)
            return stats

        for a in alerts:
            student_id = a["student_id"]
            if was_already_notified(conn, student_id, ALERT_TYPES["AUSENCIAS_CRITICAS"]):
                stats["skipped"] += 1
                continue
            ok = self.notifier.send_ausencias_criticas(
                a["parent_email"], a["parent_name"],
                a["student_name"], a["ausencias_count"], a["course"],
            )
            message = f"{a['ausencias_count']} ausencias no justificadas en {a['course']}"
            _insert_notification_log(
                conn, None, student_id,
                ALERT_TYPES["AUSENCIAS_CRITICAS"], message,
                "enviado" if ok else "fallido",
            )
            if ok:
                stats["sent"] += 1
            else:
                stats["failed"] += 1
        return stats

    def _eval_riesgo_regularidad(self, conn, stats: dict) -> dict:
        try:
            alerts = self.db_reader.get_riesgo_regularidad()
        except Exception as e:
            logger.error("Error evaluando RIESGO_REGULARIDAD: %s", e)
            return stats

        for a in alerts:
            student_id = a["student_id"]
            if was_already_notified(conn, student_id, ALERT_TYPES["RIESGO_REGULARIDAD"]):
                stats["skipped"] += 1
                continue
            ok = self.notifier.send_riesgo_regularidad(
                a["parent_email"], a["parent_name"],
                a["student_name"], a["course"],
            )
            message = f"Riesgo de regularidad por inasistencias en {a['course']}"
            _insert_notification_log(
                conn, None, student_id,
                ALERT_TYPES["RIESGO_REGULARIDAD"], message,
                "enviado" if ok else "fallido",
            )
            if ok:
                stats["sent"] += 1
            else:
                stats["failed"] += 1
        return stats

    def _eval_calificaciones_bajas(self, conn, stats: dict) -> dict:
        try:
            alerts = self.db_reader.get_calificaciones_bajas()
        except Exception as e:
            logger.error("Error evaluando CALIFICACION_BAJA: %s", e)
            return stats

        for a in alerts:
            student_id = a["student_id"]
            if was_already_notified(conn, student_id, ALERT_TYPES["CALIFICACION_BAJA"]):
                stats["skipped"] += 1
                continue
            ok = self.notifier.send_calificacion_baja(
                a["parent_email"], a["parent_name"],
                a["student_name"], a["subject_name"], a["value"],
            )
            message = f"Calificacion {a['value']} en {a['subject_name']}"
            _insert_notification_log(
                conn, None, student_id,
                ALERT_TYPES["CALIFICACION_BAJA"], message,
                "enviado" if ok else "fallido",
            )
            if ok:
                stats["sent"] += 1
            else:
                stats["failed"] += 1
        return stats

    def _eval_tareas_pendientes(self, conn, stats: dict) -> dict:
        try:
            alerts = self.db_reader.get_tareas_pendientes()
        except Exception as e:
            logger.error("Error evaluando TAREA_PENDIENTE: %s", e)
            return stats

        for a in alerts:
            student_id = a["student_id"]
            if was_already_notified(conn, student_id, ALERT_TYPES["TAREA_PENDIENTE"]):
                stats["skipped"] += 1
                continue
            ok = self.notifier.send_tarea_pendiente(
                a["parent_email"], a["parent_name"],
                a["student_name"], a["task_title"], a["due_date"],
            )
            message = f"Tarea pendiente: {a['task_title']} (vence {a['due_date']})"
            _insert_notification_log(
                conn, None, student_id,
                ALERT_TYPES["TAREA_PENDIENTE"], message,
                "enviado" if ok else "fallido",
            )
            if ok:
                stats["sent"] += 1
            else:
                stats["failed"] += 1
        return stats

    def _eval_licencias_vencimiento(self, conn, stats: dict) -> dict:
        try:
            alerts = self.db_reader.get_licencias_vencimiento()
        except Exception as e:
            logger.error("Error evaluando LICENCIA_VENCIMIENTO: %s", e)
            return stats

        for a in alerts:
            user_id = a["user_id"]
            if was_already_notified(conn, user_id, ALERT_TYPES["LICENCIA_VENCIMIENTO"]):
                stats["skipped"] += 1
                continue
            ok = self.notifier.send_licencia_vencimiento(
                a["user_email"], a["user_name"], a["end_date"],
            )
            message = f"Licencia vence el {a['end_date']} ({a.get('leave_type', '')})"
            _insert_notification_log(
                conn, user_id, None,
                ALERT_TYPES["LICENCIA_VENCIMIENTO"], message,
                "enviado" if ok else "fallido",
            )
            if ok:
                stats["sent"] += 1
            else:
                stats["failed"] += 1
        return stats
