import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/suvidha',
  USE_MEMORY_DB: process.env.USE_MEMORY_DB || 'auto',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'suvidha_jwt_access_secret_production_ready_dev_key_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'suvidha_jwt_refresh_secret_production_ready_dev_key_2026',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  EMAIL_SIMULATION: process.env.EMAIL_SIMULATION !== 'false',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@suvidha.university.edu',
};
