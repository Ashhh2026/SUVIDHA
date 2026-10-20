import path from 'path';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ENV } from './env';
import { logger } from './logger';

let mongoMemoryServer: MongoMemoryServer | null = null;
const CACHED_BINARY_DIR = path.resolve(__dirname, '../../node_modules/.cache/mongodb-memory-server');

export const connectDB = async (): Promise<void> => {
  // If memory DB is explicitly requested or in test mode
  if (ENV.USE_MEMORY_DB === 'true' || process.env.NODE_ENV === 'test') {
    logger.info('Initializing MongoMemoryServer...');
    mongoMemoryServer = await MongoMemoryServer.create({
      binary: { downloadDir: CACHED_BINARY_DIR },
    });
    const uri = mongoMemoryServer.getUri();
    await mongoose.connect(uri);
    logger.info(`Connected to In-Memory MongoDB at ${uri}`);
    return;
  }

  // Attempt real MongoDB connection
  try {
    logger.info(`Attempting to connect to MongoDB at ${ENV.MONGODB_URI}...`);
    // Connect with a 4 second server selection timeout
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    logger.info('Successfully connected to MongoDB.');
  } catch (err: any) {
    if (ENV.USE_MEMORY_DB === 'auto') {
      logger.warn(`Could not connect to external MongoDB: ${err.message}.`);
      logger.info('Falling back to embedded MongoMemoryServer for instant zero-config operation...');
      try {
        mongoMemoryServer = await MongoMemoryServer.create({
          binary: { downloadDir: CACHED_BINARY_DIR },
        });
        const uri = mongoMemoryServer.getUri();
        await mongoose.connect(uri);
        logger.info(`Connected to embedded In-Memory MongoDB at ${uri}`);
      } catch (memErr: any) {
        logger.error('Failed to start MongoMemoryServer:', memErr);
        throw memErr;
      }
    } else {
      logger.error('Database connection failed:', err);
      throw err;
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
  }
};
