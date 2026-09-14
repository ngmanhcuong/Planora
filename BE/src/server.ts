import app from './app';
import { config } from './config';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`[Planora Server]: Server is running on port ${PORT} in ${config.nodeEnv} mode.`);
  console.log(`[Planora Server]: Health check endpoint: http://localhost:${PORT}/api/health`);
});
