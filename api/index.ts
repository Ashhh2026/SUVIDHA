import { createApp } from '../backend/src/app';
import { connectDB } from '../backend/src/config/db';

let isDbConnected = false;
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

  if (!appInstance) {
    appInstance = createApp();
  }

  return appInstance(req, res);
}
