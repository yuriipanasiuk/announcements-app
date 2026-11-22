import 'dotenv/config';
import { app } from './src/app.ts';
import { logger } from './src/logger.ts';

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}: http://localhost:${PORT}`);
});
