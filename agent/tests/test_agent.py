import sys
import unittest
from unittest.mock import patch, MagicMock, call
from datetime import date

# Mock external dependencies before importing tasks modules
sys.modules["psycopg2"] = MagicMock()
sys.modules["psycopg2.extras"] = MagicMock()
sys.modules["resend"] = MagicMock()

from tasks.db_reader import DbReader
from tasks.notifier import Notifier
from tasks.alert_engine import AlertEngine, was_already_notified, _insert_notification_log


class TestDbReader(unittest.TestCase):
    """Tests for DbReader queries (Task 7.2)."""

    def setUp(self):
        self.mock_conn = MagicMock()
        self.mock_conn.closed = False  # So that close() actually proceeds
        self.mock_cursor = MagicMock()
        self.mock_conn.cursor.return_value.__enter__.return_value = self.mock_cursor

        self.patcher = patch("tasks.db_reader.psycopg2.connect", return_value=self.mock_conn)
        self.patcher.start()

        self.reader = DbReader("postgres://fake:url@localhost:5432/test")

    def tearDown(self):
        self.patcher.stop()

    def test_get_ausencias_criticas_returns_data(self):
        sample_row = {
            "student_id": 1,
            "student_name": "Juan Perez",
            "course": "1A",
            "ausencias_count": 12,
            "parent_email": "padre@test.com",
            "parent_name": "Padre Test",
        }
        self.mock_cursor.fetchall.return_value = [sample_row]

        result = self.reader.get_ausencias_criticas(10)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["student_id"], 1)
        self.assertEqual(result[0]["student_name"], "Juan Perez")
        self.assertEqual(result[0]["ausencias_count"], 12)

    def test_get_ausencias_criticas_empty_list(self):
        self.mock_cursor.fetchall.return_value = []

        result = self.reader.get_ausencias_criticas(10)

        self.assertEqual(result, [])

    def test_get_riesgo_regularidad_returns_data(self):
        sample_row = {
            "student_id": 2,
            "student_name": "Maria Gomez",
            "course": "2B",
            "parent_email": "madre@test.com",
            "parent_name": "Madre Test",
        }
        self.mock_cursor.fetchall.return_value = [sample_row]

        result = self.reader.get_riesgo_regularidad()

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["student_id"], 2)
        self.assertEqual(result[0]["student_name"], "Maria Gomez")

    def test_get_calificaciones_bajas_returns_data(self):
        sample_row = {
            "student_id": 3,
            "student_name": "Carlos Ruiz",
            "subject_name": "Matematicas",
            "value": 3.0,
            "parent_email": "padre@test.com",
            "parent_name": "Padre Test",
        }
        self.mock_cursor.fetchall.return_value = [sample_row]

        result = self.reader.get_calificaciones_bajas()

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["value"], 3.0)

    def test_get_tareas_pendientes_returns_data(self):
        sample_row = {
            "student_id": 4,
            "student_name": "Ana Lopez",
            "task_title": "Tarea de historia",
            "due_date": date(2026, 6, 4),
            "parent_email": "madre@test.com",
            "parent_name": "Madre Test",
        }
        self.mock_cursor.fetchall.return_value = [sample_row]

        result = self.reader.get_tareas_pendientes()

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["task_title"], "Tarea de historia")

    def test_get_licencias_vencimiento_returns_data(self):
        sample_row = {
            "user_id": 5,
            "user_name": "Prof. Lopez",
            "user_email": "profe@test.com",
            "end_date": date(2026, 6, 5),
            "leave_type": "enfermedad",
        }
        self.mock_cursor.fetchall.return_value = [sample_row]

        result = self.reader.get_licencias_vencimiento()

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["user_name"], "Prof. Lopez")

    def test_all_queries_return_empty_on_exception(self):
        self.mock_cursor.fetchall.side_effect = Exception("DB error")

        result = self.reader.get_ausencias_criticas(10)
        self.assertEqual(result, [])

        result = self.reader.get_riesgo_regularidad()
        self.assertEqual(result, [])

        result = self.reader.get_calificaciones_bajas()
        self.assertEqual(result, [])

        result = self.reader.get_tareas_pendientes()
        self.assertEqual(result, [])

        result = self.reader.get_licencias_vencimiento()
        self.assertEqual(result, [])

    def test_close_connection(self):
        self.reader.close()
        self.mock_conn.close.assert_called_once()

    def test_close_ignores_closed_connection(self):
        self.mock_conn.closed = True
        self.reader.close()
        self.mock_conn.close.assert_not_called()


class TestNotifier(unittest.TestCase):
    """Tests for Notifier email sending (Task 7.3)."""

    def setUp(self):
        self.api_key = "re_123456"
        self.from_email = "noreply@escuela.edu"
        self.patcher = patch("tasks.notifier.resend")
        self.mock_resend = self.patcher.start()
        self.notifier = Notifier(self.api_key, self.from_email)

    def tearDown(self):
        self.patcher.stop()

    def test_send_ausencias_criticas_success(self):
        self.mock_resend.Emails.send.return_value = {"id": "email-123"}

        result = self.notifier.send_ausencias_criticas(
            "padre@test.com", "Padre Test",
            "Juan Perez", 12, "1A",
        )

        self.assertTrue(result)
        self.mock_resend.Emails.send.assert_called_once()
        call_args = self.mock_resend.Emails.send.call_args[0][0]
        self.assertEqual(call_args["to"], "padre@test.com")
        self.assertEqual(call_args["from"], self.from_email)
        self.assertIn("Alerta de ausencias", call_args["subject"])
        self.assertIn("Juan Perez", call_args["html"])

    def test_send_riesgo_regularidad_success(self):
        self.mock_resend.Emails.send.return_value = {"id": "email-456"}

        result = self.notifier.send_riesgo_regularidad(
            "madre@test.com", "Madre Test",
            "Maria Gomez", "2B",
        )

        self.assertTrue(result)
        self.assertIn("Riesgo de regularidad", self.mock_resend.Emails.send.call_args[0][0]["subject"])

    def test_send_calificacion_baja_success(self):
        self.mock_resend.Emails.send.return_value = {"id": "email-789"}

        result = self.notifier.send_calificacion_baja(
            "padre@test.com", "Padre Test",
            "Carlos Ruiz", "Matematicas", 3.0,
        )

        self.assertTrue(result)
        self.assertIn("Calificacion baja", self.mock_resend.Emails.send.call_args[0][0]["subject"])

    def test_send_tarea_pendiente_success(self):
        self.mock_resend.Emails.send.return_value = {"id": "email-101"}

        result = self.notifier.send_tarea_pendiente(
            "madre@test.com", "Madre Test",
            "Ana Lopez", "Tarea de historia", date(2026, 6, 4),
        )

        self.assertTrue(result)
        self.assertIn("Tarea pendiente", self.mock_resend.Emails.send.call_args[0][0]["subject"])

    def test_send_licencia_vencimiento_success(self):
        self.mock_resend.Emails.send.return_value = {"id": "email-202"}

        result = self.notifier.send_licencia_vencimiento(
            "profe@test.com", "Prof. Lopez", date(2026, 6, 5),
        )

        self.assertTrue(result)
        self.assertIn("Vencimiento de licencia docente", self.mock_resend.Emails.send.call_args[0][0]["subject"])

    def test_send_email_failure_returns_false(self):
        self.mock_resend.Emails.send.side_effect = Exception("Resend API error")

        result = self.notifier.send_ausencias_criticas(
            "padre@test.com", "Padre Test",
            "Juan Perez", 12, "1A",
        )

        self.assertFalse(result)

    def test_resend_api_key_set_on_init(self):
        self.assertEqual(self.mock_resend.api_key, self.api_key)


class TestAlertEngine(unittest.TestCase):
    """Tests for AlertEngine anti-spam and orchestration (Task 7.4)."""

    def setUp(self):
        self.mock_conn = MagicMock()
        self.mock_cursor = MagicMock()
        self.mock_conn.cursor.return_value.__enter__.return_value = self.mock_cursor

        self.db_patcher = patch("tasks.alert_engine.DbReader")
        self.notifier_patcher = patch("tasks.alert_engine.Notifier")
        self.mock_db_cls = self.db_patcher.start()
        self.mock_notifier_cls = self.notifier_patcher.start()

        self.mock_db_instance = MagicMock()
        self.mock_notifier_instance = MagicMock()
        self.mock_db_cls.return_value = self.mock_db_instance
        self.mock_notifier_cls.return_value = self.mock_notifier_instance

        # Patch the free functions used by AlertEngine
        self.was_already_notified_patcher = patch("tasks.alert_engine.was_already_notified")
        self.mock_was_notified = self.was_already_notified_patcher.start()
        self.insert_log_patcher = patch("tasks.alert_engine._insert_notification_log")
        self.mock_insert_log = self.insert_log_patcher.start()

        self.engine = AlertEngine(
            database_url="postgres://fake:url@localhost:5432/test",
            resend_api_key="re_123456",
            from_email="noreply@escuela.edu",
            ausencia_umbral=10,
        )

        # Override conn to use our mock
        self.engine.db_reader = self.mock_db_instance
        self.engine.notifier = self.mock_notifier_instance

    def tearDown(self):
        self.db_patcher.stop()
        self.notifier_patcher.stop()
        self.was_already_notified_patcher.stop()
        self.insert_log_patcher.stop()

    # --- Anti-spam: already notified → skip ---

    def test_anti_spam_skips_already_notified_ausencias(self):
        self.mock_db_instance.get_ausencias_criticas.return_value = [
            {"student_id": 1, "student_name": "Juan", "course": "1A",
             "ausencias_count": 12, "parent_email": "p@t.com", "parent_name": "P"},
        ]
        self.mock_was_notified.return_value = True

        stats = self.engine._eval_ausencias_criticas(self.mock_conn, {"sent": 0, "failed": 0, "skipped": 0})

        self.assertEqual(stats["skipped"], 1)
        self.assertEqual(stats["sent"], 0)
        self.mock_notifier_instance.send_ausencias_criticas.assert_not_called()

    def test_anti_spam_skips_already_notified_riesgo(self):
        self.mock_db_instance.get_riesgo_regularidad.return_value = [
            {"student_id": 2, "student_name": "Maria", "course": "2B",
             "parent_email": "m@t.com", "parent_name": "M"},
        ]
        self.mock_was_notified.return_value = True

        stats = self.engine._eval_riesgo_regularidad(self.mock_conn, {"sent": 0, "failed": 0, "skipped": 0})

        self.assertEqual(stats["skipped"], 1)
        self.mock_notifier_instance.send_riesgo_regularidad.assert_not_called()

    # --- Anti-spam: not notified → send email ---

    def test_anti_spam_sends_when_not_notified_ausencias(self):
        self.mock_db_instance.get_ausencias_criticas.return_value = [
            {"student_id": 1, "student_name": "Juan", "course": "1A",
             "ausencias_count": 12, "parent_email": "p@t.com", "parent_name": "P"},
        ]
        self.mock_was_notified.return_value = False
        self.mock_notifier_instance.send_ausencias_criticas.return_value = True

        stats = self.engine._eval_ausencias_criticas(self.mock_conn, {"sent": 0, "failed": 0, "skipped": 0})

        self.assertEqual(stats["sent"], 1)
        self.mock_notifier_instance.send_ausencias_criticas.assert_called_once()

    def test_anti_spam_sends_when_not_notified_riesgo(self):
        self.mock_db_instance.get_riesgo_regularidad.return_value = [
            {"student_id": 2, "student_name": "Maria", "course": "2B",
             "parent_email": "m@t.com", "parent_name": "M"},
        ]
        self.mock_was_notified.return_value = False
        self.mock_notifier_instance.send_riesgo_regularidad.return_value = True

        stats = self.engine._eval_riesgo_regularidad(self.mock_conn, {"sent": 0, "failed": 0, "skipped": 0})

        self.assertEqual(stats["sent"], 1)
        self.mock_notifier_instance.send_riesgo_regularidad.assert_called_once()

    # --- Error handling: one alert failure doesn't block others ---

    def test_error_in_one_alert_does_not_block_others(self):
        self.mock_db_instance.get_ausencias_criticas.side_effect = Exception("DB timeout")
        self.mock_db_instance.get_riesgo_regularidad.return_value = [
            {"student_id": 2, "student_name": "Maria", "course": "2B",
             "parent_email": "m@t.com", "parent_name": "M"},
        ]
        self.mock_was_notified.return_value = False
        self.mock_notifier_instance.send_riesgo_regularidad.return_value = True

        stats = self.engine._eval_ausencias_criticas(self.mock_conn, {"sent": 0, "failed": 0, "skipped": 0})
        stats = self.engine._eval_riesgo_regularidad(self.mock_conn, stats)

        self.assertEqual(stats["sent"], 1)
        self.assertEqual(stats["failed"], 0)
        self.assertEqual(stats["skipped"], 0)

    # --- Send failure increments failed counter ---

    def test_send_failure_increments_failed(self):
        self.mock_db_instance.get_ausencias_criticas.return_value = [
            {"student_id": 1, "student_name": "Juan", "course": "1A",
             "ausencias_count": 12, "parent_email": "p@t.com", "parent_name": "P"},
        ]
        self.mock_was_notified.return_value = False
        self.mock_notifier_instance.send_ausencias_criticas.return_value = False

        stats = self.engine._eval_ausencias_criticas(self.mock_conn, {"sent": 0, "failed": 0, "skipped": 0})

        self.assertEqual(stats["failed"], 1)
        self.assertEqual(stats["sent"], 0)


class TestWasAlreadyNotified(unittest.TestCase):
    """Tests for the was_already_notified helper."""

    def setUp(self):
        self.mock_conn = MagicMock()
        self.mock_cursor = MagicMock()
        self.mock_conn.cursor.return_value.__enter__.return_value = self.mock_cursor

    def test_returns_true_when_count_gt_zero(self):
        self.mock_cursor.fetchone.return_value = (3,)

        result = was_already_notified(self.mock_conn, 1, "ausencias_criticas")

        self.assertTrue(result)

    def test_returns_false_when_count_is_zero(self):
        self.mock_cursor.fetchone.return_value = (0,)

        result = was_already_notified(self.mock_conn, 1, "ausencias_criticas")

        self.assertFalse(result)

    def test_returns_false_when_student_id_is_none(self):
        result = was_already_notified(self.mock_conn, None, "licencia_vencimiento")

        self.assertFalse(result)
        self.mock_cursor.execute.assert_not_called()

    def test_returns_false_on_exception(self):
        self.mock_cursor.execute.side_effect = Exception("DB error")

        result = was_already_notified(self.mock_conn, 1, "ausencias_criticas")

        self.assertFalse(result)


class TestInsertNotificationLog(unittest.TestCase):
    """Tests for the _insert_notification_log helper."""

    def setUp(self):
        self.mock_conn = MagicMock()
        self.mock_cursor = MagicMock()
        self.mock_conn.cursor.return_value.__enter__.return_value = self.mock_cursor

    def test_inserts_log(self):
        _insert_notification_log(
            self.mock_conn, 1, 2, "ausencias_criticas",
            "12 ausencias no justificadas", "enviado",
        )

        self.mock_cursor.execute.assert_called_once()
        self.mock_conn.commit.assert_called_once()

    def test_rollback_on_error(self):
        self.mock_cursor.execute.side_effect = Exception("Insert error")

        _insert_notification_log(
            self.mock_conn, 1, 2, "ausencias_criticas",
            "12 ausencias no justificadas", "enviado",
        )

        self.mock_conn.rollback.assert_called_once()


if __name__ == "__main__":
    unittest.main()
