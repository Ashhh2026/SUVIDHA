import { createApp } from '../backend/src/app';
import { connectDB } from '../backend/src/config/db';
import { Department } from '../backend/src/models/Department';
import { seedDatabase } from '../backend/src/scripts/seed';

// On Vercel serverless, disable MongoMemoryServer to avoid binary downloads in read-only /tmp
process.env.USE_MEMORY_DB = 'false';

let isDbConnected = false;
let isSeeded = false;
let appInstance: any = null;

export default async function handler(req: any, res: any) {
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
    } catch (error) {
      console.error('Failed to connect to MongoDB in Vercel function:', error);
    }
  }

  // Auto-seed initial academic data (CSE, ECE, ME, Civil + demo users) if database is brand new
  if (isDbConnected && !isSeeded) {
    try {
      const deptCount = await Department.countDocuments();
      if (deptCount === 0) {
        console.log('Database empty on Vercel boot. Auto-seeding departments, courses, and demo users...');
        await seedDatabase();
        console.log('Auto-seed completed successfully!');
      }
      isSeeded = true;
    } catch (seedErr) {
      console.error('Failed to auto-seed initial database data:', seedErr);
    }
  }

  if (!appInstance) {
    appInstance = createApp();
  }

  return appInstance(req, res);
}
