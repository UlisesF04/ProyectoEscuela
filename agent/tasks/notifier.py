import logging

import resend

logger = logging.getLogger(__name__)


class Notifier:
    def __init__(self, api_key: str, from_email: str):
        self.from_email = from_email
        self.api_key = api_key
        if resend.api_key != self.api_key:
            resend.api_key = self.api_key

    def send_ausencias_criticas(
        self, parent_email: str, parent_name: str,
        student_name: str, ausencias_count: int, course: str,
    ) -> bool:
        subject = f"Alerta de ausencias - {student_name}"
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#c0392b;">Alerta de Ausencias Criticas</h2>
            <p>Hola <strong>{parent_name}</strong>,</p>
            <p>Te informamos que <strong>{student_name}</strong> del curso <strong>{course}</strong>
               acumula <strong>{ausencias_count} ausencias</strong> no justificadas.</p>
            <p>Te recomendamos contactar a la escuela para regularizar la situacion.</p>
            <hr style="border:none;border-top:1px solid #eee;">
            <p style="font-size:12px;color:#999;">Escuela - Sistema de Notificaciones</p>
        </div>
        """
        return self._send_email(parent_email, subject, html)

    def send_riesgo_regularidad(
        self, parent_email: str, parent_name: str,
        student_name: str, course: str,
    ) -> bool:
        subject = f"Riesgo de regularidad - {student_name}"
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#e67e22;">Riesgo de Regularidad</h2>
            <p>Hola <strong>{parent_name}</strong>,</p>
            <p>Te informamos que <strong>{student_name}</strong> del curso <strong>{course}</strong>
               supero el 20% de inasistencias, lo que podria afectar su regularidad.</p>
            <p>Te recomendamos contactar a la escuela para regularizar la situacion.</p>
            <hr style="border:none;border-top:1px solid #eee;">
            <p style="font-size:12px;color:#999;">Escuela - Sistema de Notificaciones</p>
        </div>
        """
        return self._send_email(parent_email, subject, html)

    def send_calificacion_baja(
        self, parent_email: str, parent_name: str,
        student_name: str, subject_name: str, value: float,
    ) -> bool:
        subject = f"Calificacion baja - {student_name}"
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#e74c3c;">Calificacion Baja</h2>
            <p>Hola <strong>{parent_name}</strong>,</p>
            <p>Te informamos que <strong>{student_name}</strong> obtuvo una calificacion
               de <strong>{value}</strong> en la materia <strong>{subject_name}</strong>.</p>
            <p>Te recomendamos contactar al docente para mas informacion.</p>
            <hr style="border:none;border-top:1px solid #eee;">
            <p style="font-size:12px;color:#999;">Escuela - Sistema de Notificaciones</p>
        </div>
        """
        return self._send_email(parent_email, subject, html)

    def send_tarea_pendiente(
        self, parent_email: str, parent_name: str,
        student_name: str, task_title: str, due_date,
    ) -> bool:
        subject = f"Tarea pendiente - {student_name}"
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#f39c12;">Tarea Pendiente</h2>
            <p>Hola <strong>{parent_name}</strong>,</p>
            <p>Te informamos que <strong>{student_name}</strong> tiene la tarea
               <strong>"{task_title}"</strong> pendiente de entrega,
               con vencimiento el <strong>{due_date}</strong>.</p>
            <p>Te recordamos la importancia de cumplir con las entregas a tiempo.</p>
            <hr style="border:none;border-top:1px solid #eee;">
            <p style="font-size:12px;color:#999;">Escuela - Sistema de Notificaciones</p>
        </div>
        """
        return self._send_email(parent_email, subject, html)

    def send_licencia_vencimiento(
        self, user_email: str, user_name: str, end_date,
    ) -> bool:
        subject = "Vencimiento de licencia docente"
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#8e44ad;">Vencimiento de Licencia</h2>
            <p>Hola <strong>{user_name}</strong>,</p>
            <p>Te informamos que tu licencia docente vence el <strong>{end_date}</strong>.</p>
            <p>Te recordamos gestionar los tramites necesarios si requieres una extension.</p>
            <hr style="border:none;border-top:1px solid #eee;">
            <p style="font-size:12px;color:#999;">Escuela - Sistema de Notificaciones</p>
        </div>
        """
        return self._send_email(user_email, subject, html)

    def _send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        logger.info("Enviando email (destinatario oculto) | Asunto: %s", subject)
        logger.debug("Preparando envío de email")
        try:
            response = resend.Emails.send({
                "from": self.from_email,
                "to": to_email,
                "subject": subject,
                "html": html_body,
            })
            logger.info("Email enviado OK")
            logger.debug("Respuesta de API de email recibida")
            return True
        except Exception as e:
            logger.error("Error enviando email (detalles ocultos)")
            logger.debug("Error en envío de email (tipo: %s)", type(e).__name__)
            return False
