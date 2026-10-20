import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';

const app = createApp();

describe('Authentication & Security Tests', () => {
  beforeAll(async () => {
    process.env.USE_MEMORY_DB = 'true';
    await connectDB();
    await User.deleteMany({});
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('should successfully register a student with valid parameters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Student',
        email: 'test.student@university.edu',
        password: 'Password@123',
        studentId: '2024TEST01',
        semester: 7,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test.student@university.edu');

    // Verify stored user in DB has password hashed, not plain text
    const dbUser = await User.findOne({ email: 'test.student@university.edu' });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.password).not.toBe('Password@123');
    expect(dbUser?.password).toContain('$2');
  });

  it('should reject registration with invalid password (missing number/uppercase)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Invalid User',
        email: 'invalid@university.edu',
        password: 'weakpassword',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should prevent duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Student',
        email: 'test.student@university.edu',
        password: 'Password@123',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already exists');
  });

  it('should authenticate user and return token on valid login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test.student@university.edu',
        password: 'Password@123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('test.student@university.edu');
    expect(res.body.data.user.password).toBeUndefined(); // Never expose password in response
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test.student@university.edu',
        password: 'WrongPassword@999',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
