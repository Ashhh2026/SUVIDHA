import bcrypt from 'bcryptjs';
import { ENV } from '../config/env';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, ENV.BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (candidatePassword: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(candidatePassword, hash);
};
