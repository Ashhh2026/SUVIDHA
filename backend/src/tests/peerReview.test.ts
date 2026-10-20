import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Department } from '../models/Department';
import { Course } from '../models/Course';
import { PeerReview } from '../models/PeerReview';
import { generateAccessToken } from '../utils/token';

const app = createApp();

describe('Classmate Peer Review & Anonymity Tests', () => {
  let student1Token: string;
  let student2Token: string;
  let student1Id: string;
  let student2Id: string;
  let student3Id: string;

  beforeAll(async () => {
    process.env.USE_MEMORY_DB = 'true';
    await connectDB();
    await User.deleteMany({});
    await Department.deleteMany({});
    await Course.deleteMany({});
    await PeerReview.deleteMany({});

    const dept = await Department.create({
      name: 'Computer Science',
      code: 'CSE',
      isActive: true,
    });

    const course = await Course.create({
      name: 'B.Tech CSE',
      code: 'BT-CSE',
      department: dept._id,
      durationYears: 4,
      totalSemesters: 8,
    });

    const s1 = await User.create({
      name: 'Alice Student',
      email: 'alice@suvidha.edu',
      password: '$2b$10$hashedpassword',
      role: 'student',
      studentId: '2023CS001',
      department: dept._id,
      course: course._id,
      semester: 7,
      isEmailVerified: true,
      isActive: true,
    });

    const s2 = await User.create({
      name: 'Bob Classmate',
      email: 'bob@suvidha.edu',
      password: '$2b$10$hashedpassword',
      role: 'student',
      studentId: '2023CS002',
      department: dept._id,
      course: course._id,
      semester: 7,
      isEmailVerified: true,
      isActive: true,
    });

    const s3 = await User.create({
      name: 'Charlie Peer',
      email: 'charlie@suvidha.edu',
      password: '$2b$10$hashedpassword',
      role: 'student',
      studentId: '2023CS003',
      department: dept._id,
      course: course._id,
      semester: 7,
      isEmailVerified: true,
      isActive: true,
    });

    student1Id = s1._id.toString();
    student2Id = s2._id.toString();
    student3Id = s3._id.toString();

    student1Token = generateAccessToken({
      userId: student1Id,
      email: s1.email,
      role: s1.role,
    });

    student2Token = generateAccessToken({
      userId: student2Id,
      email: s2.email,
      role: s2.role,
    });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('should list classmates belonging to the same department, course, and semester', async () => {
    const res = await request(app)
      .get('/api/peer-reviews/classmates')
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.classmates).toHaveLength(2);
    expect(res.body.data.totalClassmates).toBe(2);
    expect(res.body.data.totalReviewed).toBe(0);
    // Alice should see Bob and Charlie, but not herself
    const names = res.body.data.classmates.map((c: any) => c.name);
    expect(names).toContain('Bob Classmate');
    expect(names).toContain('Charlie Peer');
    expect(names).not.toContain('Alice Student');
  });

  it('should prevent a student from reviewing themselves', async () => {
    const res = await request(app)
      .post('/api/peer-reviews/submit')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        revieweeId: student1Id,
        ratings: {
          teamwork: 5,
          communication: 5,
          problemSolving: 5,
          punctuality: 5,
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('cannot review yourself');
  });

  it('should allow student 1 to submit a peer review for classmate Bob', async () => {
    const res = await request(app)
      .post('/api/peer-reviews/submit')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        revieweeId: student2Id,
        ratings: {
          teamwork: 5,
          communication: 4,
          problemSolving: 5,
          punctuality: 4,
        },
        strengths: ['Great Leader', 'Quick Problem Solver'],
        areasForImprovement: 'Keep sharing git commits earlier',
        comments: 'Great teammate during our cloud architecture project',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ratings.overall).toBe(4.5);

    // Verify Bob is now marked as reviewed in Alice classmate list
    const listRes = await request(app)
      .get('/api/peer-reviews/classmates')
      .set('Authorization', `Bearer ${student1Token}`);

    expect(listRes.body.data.totalReviewed).toBe(1);
    const bob = listRes.body.data.classmates.find((c: any) => c._id === student2Id);
    expect(bob.isReviewed).toBe(true);
  });

  it('should ensure reviewee sees feedback strictly without reviewer identity', async () => {
    // Bob checks his received reviews
    const res = await request(app)
      .get('/api/peer-reviews/my-received')
      .set('Authorization', `Bearer ${student2Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalReviewsReceived).toBe(1);
    expect(res.body.data.averageRatings.overall).toBe(4.5);
    expect(res.body.data.topStrengths).toContainEqual({ tag: 'Great Leader', count: 1 });

    const reviewItem = res.body.data.feedbackList[0];
    expect(reviewItem.comments).toBe('Great teammate during our cloud architecture project');

    // CRITICAL SECURITY / PRIVACY CHECK: Reviewer identity must be completely absent when isAnonymous is true
    expect(reviewItem.isAnonymous).toBe(true);
    expect(reviewItem.reviewer).toBeNull();
    expect(JSON.stringify(reviewItem)).not.toContain('Alice');
    expect(JSON.stringify(reviewItem)).not.toContain('alice@suvidha.edu');
  });

  it('should reject a review containing abusive or inappropriate language', async () => {
    const res = await request(app)
      .post('/api/peer-reviews/submit')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        revieweeId: student3Id,
        ratings: {
          teamwork: 1,
          communication: 1,
          problemSolving: 1,
          punctuality: 1,
        },
        comments: 'This person is an idiot and useless',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('inappropriate or abusive language');
  });

  it('should allow a reviewer to submit an identified (named) review and reveal reviewer name', async () => {
    // Charlie reviews Alice with isAnonymous = false
    const charlieToken = generateAccessToken({
      userId: student3Id,
      email: 'charlie@suvidha.edu',
      role: 'student',
    });

    const res = await request(app)
      .post('/api/peer-reviews/submit')
      .set('Authorization', `Bearer ${charlieToken}`)
      .send({
        revieweeId: student1Id,
        ratings: {
          teamwork: 5,
          communication: 5,
          problemSolving: 5,
          punctuality: 5,
        },
        strengths: ['Great Leader'],
        comments: 'Loved working together on the research project!',
        isAnonymous: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.isAnonymous).toBe(false);

    // Alice checks her received reviews and should see Charlie's name
    const aliceReceivedRes = await request(app)
      .get('/api/peer-reviews/my-received')
      .set('Authorization', `Bearer ${student1Token}`);

    expect(aliceReceivedRes.status).toBe(200);
    const charlieReview = aliceReceivedRes.body.data.feedbackList.find(
      (f: any) => f.comments === 'Loved working together on the research project!'
    );
    expect(charlieReview).toBeDefined();
    expect(charlieReview.isAnonymous).toBe(false);
    expect(charlieReview.reviewer).not.toBeNull();
    expect(charlieReview.reviewer.name).toBe('Charlie Peer');
    expect(charlieReview.reviewer.studentId).toBe('2023CS003');
  });
});
