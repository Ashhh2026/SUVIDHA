import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { Feedback } from '../models/Feedback';
import { Grievance } from '../models/Grievance';
import { User } from '../models/User';
import { generateAccessToken } from '../utils/token';

const app = createApp();

describe('Anonymous Privacy & Security Boundaries', () => {
  let studentToken: string;
  let studentId: string;

  beforeAll(async () => {
    process.env.USE_MEMORY_DB = 'true';
    await connectDB();
    await Feedback.deleteMany({});
    await Grievance.deleteMany({});
    await User.deleteMany({});

    const student = await User.create({
      name: 'John Doe',
      email: 'john.doe@university.edu',
      password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
      role: 'student',
      studentId: '2024CS9999',
      isEmailVerified: true,
      isActive: true,
    });

    studentId = student._id.toString();
    studentToken = generateAccessToken({
      userId: studentId,
      role: 'student',
      email: student.email,
    });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('should guarantee that anonymous feedback has NULL student reference in DB even if logged in', async () => {
    const res = await request(app)
      .post('/api/feedback/submit')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        category: 'infrastructure_facilities',
        submissionMode: 'anonymous',
        overallRating: 3,
        comments: 'Lab air conditioning is making humming noise.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const refNumber = res.body.data.referenceNumber;
    const stored = await Feedback.findOne({ referenceNumber: refNumber });

    expect(stored).not.toBeNull();
    // Critical privacy assertion: student reference in DB MUST be null
    expect(stored?.student).toBeNull();
    expect(stored?.submissionMode).toBe('anonymous');
  });

  it('should return unguessable tracking token for anonymous grievance and verify progress tracking without account', async () => {
    const res = await request(app)
      .post('/api/grievances/submit')
      .send({
        title: 'Broken handrail on north stairway',
        description: 'The metal handrail on the stairway between 2nd and 3rd floor is loose and unsafe.',
        category: 'facilities',
        priority: 'high',
        submissionMode: 'anonymous',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.trackingToken).toBeDefined();

    const rawToken = res.body.data.trackingToken;
    const refNum = res.body.data.referenceNumber;

    // Verify DB stores hashed token, not raw token
    const storedGrievance = await Grievance.findOne({ referenceNumber: refNum });
    expect(storedGrievance?.student).toBeNull();
    expect(storedGrievance?.anonymousTrackingTokenHash).not.toBe(rawToken);

    // Track grievance using anonymous token
    const trackRes = await request(app)
      .post('/api/grievances/track-anonymous')
      .send({ token: rawToken });

    expect(trackRes.status).toBe(200);
    expect(trackRes.body.success).toBe(true);
    expect(trackRes.body.data.grievance.referenceNumber).toBe(refNum);
    expect(trackRes.body.data.grievance.student).toBeUndefined(); // Never leak student field
    expect(trackRes.body.data.grievance.anonymousTrackingTokenHash).toBeUndefined(); // Never leak hash
  });
});
