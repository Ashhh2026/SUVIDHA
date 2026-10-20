import { createApp } from './app';
import { connectDB } from './config/db';
import { ENV } from './config/env';
import { logger } from './config/logger';
import { User } from './models/User';
import { seedDatabase } from './scripts/seed';

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed in development if database has no users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      logger.info('Database is empty. Automatically seeding demo accounts and campus data...');
      await seedDatabase();
      logger.info('Auto-seed completed successfully.');
    }

    const app = createApp();
    const port = parseInt(ENV.PORT, 10) || 5000;

    app.listen(port, () => {
      logger.info(`====================================================`);
      logger.info(`  SUVIDHA — Student Feedback & Grievance System   `);
      logger.info(`  Backend API Server running at http://localhost:${port}`);
      logger.info(`  Environment: ${ENV.NODE_ENV}`);
      logger.info(`====================================================`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
