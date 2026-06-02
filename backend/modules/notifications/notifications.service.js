const { sequelize } = require('../../models');
const { QueryTypes } = require('sequelize');
const { spawn } = require('child_process');
const path = require('path');
const AppError = require('../../utils/AppError');

class NotificationService {
  async getNotifications(filters = {}) {
    let where = [];
    const replacements = {};

    if (filters.type) {
      where.push('nl.type = :type');
      replacements.type = filters.type;
    }
    if (filters.alert_type) {
      where.push('nl.alert_type = :alert_type');
      replacements.alert_type = filters.alert_type;
    }
    if (filters.status) {
      where.push('nl.status = :status');
      replacements.status = filters.status;
    }
    if (filters.from) {
      where.push('nl.sent_at >= :from');
      replacements.from = filters.from;
    }
    if (filters.to) {
      where.push('nl.sent_at <= :to');
      replacements.to = filters.to;
    }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const notifications = await sequelize.query(`
      SELECT nl.*,
        u.first_name || ' ' || u.last_name as recipient_name,
        u.email as recipient_email,
        s.first_name || ' ' || s.last_name as student_name
      FROM notification_logs nl
      LEFT JOIN users u ON nl.recipient_id = u.id
      LEFT JOIN students s ON nl.student_id = s.id
      ${whereClause}
      ORDER BY nl.sent_at DESC
      LIMIT 100
    `, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return notifications;
  }

  async getTypes() {
    const types = await sequelize.query(`
      SELECT DISTINCT type FROM notification_logs ORDER BY type
    `, { type: QueryTypes.SELECT });
    return types.map(t => t.type);
  }

  async getAlertTypes() {
    const types = await sequelize.query(`
      SELECT DISTINCT alert_type FROM notification_logs ORDER BY alert_type
    `, { type: QueryTypes.SELECT });
    return types.map(t => t.alert_type);
  }

  async runAgent() {
    const projectRoot = path.resolve(__dirname, '..', '..', '..');
    const scriptPath = path.join(projectRoot, 'agent', 'main.py');

    return new Promise((resolve, reject) => {
      const child = spawn('python', [scriptPath, '--now'], {
        cwd: projectRoot,
        env: process.env,
        timeout: 120_000,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (err) => {
        reject(new AppError(`Error al ejecutar el agente: ${err.message}`, 500));
      });

      child.on('close', (exitCode) => {
        const summaryMatch = stderr.match(
          /Alertas:\s*(\d+)\s+enviadas,\s*(\d+)\s+fallidas,\s*(\d+)\s+saltadas/i
        );

        if (summaryMatch) {
          resolve({
            scheduled: true,
            summary: {
              sent: parseInt(summaryMatch[1], 10),
              failed: parseInt(summaryMatch[2], 10),
              skipped: parseInt(summaryMatch[3], 10),
              exitCode,
            },
          });
        } else {
          resolve({
            scheduled: true,
            summary: {
              sent: 0,
              failed: 0,
              skipped: 0,
              exitCode,
            },
            raw: { stdout, stderr },
          });
        }
      });
    });
  }
}

module.exports = new NotificationService();
