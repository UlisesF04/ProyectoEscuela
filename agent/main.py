"""
Agente automatizado de notificaciones escolares.
Ejecuta tareas programadas para evaluar condiciones de alerta
y enviar notificaciones vía WhatsApp (Twilio).
"""

import logging
from datetime import datetime

from apscheduler.schedulers.blocking import BlockingScheduler

from config import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def daily_check() -> None:
    """Placeholder: tarea diaria de evaluacion de alertas."""
    logger.info("Ejecutando evaluacion diaria de alertas...")
    # TODO: Implementar en C-10 notification-agent
    # 1. Leer datos de BD (db_reader)
    # 2. Evaluar condiciones de alerta (alert_engine)
    # 3. Enviar notificaciones (notifier)
    logger.info("Evaluacion diaria completada.")


def main() -> None:
    """Inicializa el scheduler y programa las tareas."""
    logger.info("Iniciando agente de notificaciones...")

    scheduler = BlockingScheduler()

    # Ejecucion diaria: lunes a viernes a las 18:00 hs
    scheduler.add_job(
        daily_check,
        "cron",
        day_of_week="mon-fri",
        hour=18,
        minute=0,
        id="daily_notification_check",
    )

    logger.info(
        "Scheduler iniciado. Proxima ejecucion: lunes-viernes 18:00."
    )

    try:
        scheduler.start()
    except KeyboardInterrupt:
        logger.info("Agente detenido por el usuario.")
        scheduler.shutdown()


if __name__ == "__main__":
    main()
