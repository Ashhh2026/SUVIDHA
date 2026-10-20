import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { hashPassword } from '../utils/hash';
import { logger } from '../config/logger';

export const bootstrapAdmin = async () => {
  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@suvidha.edu';
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'Admin@12345';
  const adminName = process.env.ADMIN_BOOTSTRAP_NAME || 'Campus Administrator';

  logger.info(`Bootstrapping administrator account (${adminEmail})...`);

  const existing = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existing) {
    logger.info(`Administrator account with email ${adminEmail} already exists.`);
    return;
  }

  const hashedPassword = await hashPassword(adminPassword);
  await User.create({
    name: adminName,
    email: adminEmail.toLowerCase(),
    password: hashedPassword,
    role: 'admin',
    isEmailVerified: true,
    isActive: true,
  });

  logger.info(`Successfully created primary administrator account for ${adminEmail}.`);
};

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await bootstrapAdmin();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      logger.error('Failed to bootstrap administrator:', err);
      process.exit(1);
    }
  })();
}
