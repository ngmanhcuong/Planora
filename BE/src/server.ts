import app from './app';
import { config } from './config';
import { NotificationsService } from './modules/notifications';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`[Planora Server]: Server is running on port ${PORT} in ${config.nodeEnv} mode.`);
  console.log(`[Planora Server]: Health check endpoint: http://localhost:${PORT}/api/health`);

  const runReminderScheduler = () => {
    void NotificationsService.generateDueNotificationsForAllUsers().catch((error) => {
      console.error('[Reminder scheduler] Run failed:', error instanceof Error ? error.message : error);
    });
  };
  setTimeout(runReminderScheduler, 5000).unref();
  setInterval(runReminderScheduler, 60_000).unref();
});
