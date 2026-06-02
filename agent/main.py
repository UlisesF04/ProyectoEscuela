import logging
import sys

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

from config import config
from tasks.alert_engine import AlertEngine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def run_alerts() -> None:
    logger.info("Iniciando evaluacion diaria de alertas...")
    try:
        engine = AlertEngine(
            database_url=config.DATABASE_URL,
            resend_api_key=config.RESEND_API_KEY,
            from_email=config.FROM_EMAIL,
            ausencia_umbral=config.AUSENCIA_UMBRAL,
        )
        engine.run()
    except Exception as e:
        logger.error("Error fatal en la evaluacion de alertas: %s", e, exc_info=True)
    logger.info("Evaluacion diaria de alertas finalizada.")


def main() -> None:
    if len(sys.argv) > 1 and sys.argv[1] == "--now":
        logger.info("Ejecucion inmediata solicitada (--now)")
        run_alerts()
        return

    logger.info("Iniciando agente de notificaciones escolares...")

    scheduler = BlockingScheduler()
    scheduler.add_job(
        run_alerts,
        CronTrigger(day_of_week="mon-fri", hour=18, minute=0),
        id="daily_notification_check",
    )

    logger.info("Scheduler iniciado. Proxima ejecucion: lunes-viernes 18:00.")

    try:
        scheduler.start()
    except KeyboardInterrupt:
        logger.info("Agente detenido por el usuario.")
        scheduler.shutdown()


if __name__ == "__main__":
    main()
