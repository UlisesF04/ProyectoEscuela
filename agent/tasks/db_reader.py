import logging

import psycopg2
import psycopg2.extras

logger = logging.getLogger(__name__)


class DbReader:
    def __init__(self, database_url: str):
        self.conn = psycopg2.connect(database_url)

    def get_ausencias_criticas(self, umbral: int) -> list[dict]:
        query = """
            SELECT s.id as student_id,
                   s.first_name || ' ' || s.last_name as student_name,
                   c.name as course,
                   COUNT(*) as ausencias_count,
                   u.email as parent_email,
                   u.first_name || ' ' || u.last_name as parent_name
            FROM attendances a
            JOIN students s ON a.student_id = s.id
            JOIN courses c ON s.course_id = c.id
            JOIN parent_student ps ON s.id = ps.student_id
            JOIN users u ON ps.user_id = u.id
            WHERE a.status = 'ausente' AND a.is_justified = false
            GROUP BY s.id, c.name, u.email, u.first_name, u.last_name
            HAVING COUNT(*) >= %s
        """
        try:
            with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                cur.execute(query, (umbral,))
                return [dict(row) for row in cur.fetchall()]
        except Exception as e:
            logger.error("Error en get_ausencias_criticas: %s", e)
            return []

    def get_riesgo_regularidad(self) -> list[dict]:
        query = """
            WITH ausencias AS (
                SELECT student_id, COUNT(*) as ausencias_count
                FROM attendances
                WHERE status = 'ausente' AND is_justified = false
                GROUP BY student_id
            ),
            total_dias AS (
                SELECT COUNT(DISTINCT date) as total FROM attendances
            )
            SELECT s.id as student_id,
                   s.first_name || ' ' || s.last_name as student_name,
                   c.name as course,
                   u.email as parent_email,
                   u.first_name || ' ' || u.last_name as parent_name
            FROM ausencias a
            CROSS JOIN total_dias t
            JOIN students s ON a.student_id = s.id
            JOIN courses c ON s.course_id = c.id
            JOIN parent_student ps ON s.id = ps.student_id
            JOIN users u ON ps.user_id = u.id
            WHERE a.ausencias_count::float / t.total >= %s
        """
        try:
            with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                cur.execute(query, (0.20,))
                return [dict(row) for row in cur.fetchall()]
        except Exception as e:
            logger.error("Error en get_riesgo_regularidad: %s", e)
            return []

    def get_calificaciones_bajas(self) -> list[dict]:
        query = """
            SELECT s.id as student_id,
                   s.first_name || ' ' || s.last_name as student_name,
                   sub.name as subject_name,
                   g.grade as value,
                   u.email as parent_email,
                   u.first_name || ' ' || u.last_name as parent_name
            FROM grades g
            JOIN students s ON g.student_id = s.id
            JOIN subjects sub ON g.subject_id = sub.id
            JOIN parent_student ps ON s.id = ps.student_id
            JOIN users u ON ps.user_id = u.id
            WHERE g.grade < 4 AND g.created_at::date = CURRENT_DATE
        """
        try:
            with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                cur.execute(query)
                return [dict(row) for row in cur.fetchall()]
        except Exception as e:
            logger.error("Error en get_calificaciones_bajas: %s", e)
            return []

    def get_setting(self, key: str):
        try:
            with self.conn.cursor() as cur:
                cur.execute("SELECT value FROM settings WHERE key = %s", (key,))
                row = cur.fetchone()
                if row:
                    return row[0]
                return None
        except Exception as e:
            logger.warning("Error reading setting '%s': %s", key, e)
            return None

    def close(self) -> None:
        try:
            if self.conn and not self.conn.closed:
                self.conn.close()
        except Exception as e:
            logger.error("Error cerrando conexion BD: %s", e)
