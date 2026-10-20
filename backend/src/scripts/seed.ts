import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Department } from '../models/Department';
import { Course } from '../models/Course';
import { Subject } from '../models/Subject';
import { Feedback } from '../models/Feedback';
import { Grievance } from '../models/Grievance';
import { GrievanceUpdate } from '../models/GrievanceUpdate';
import { Announcement } from '../models/Announcement';
import { Notification } from '../models/Notification';
import { AuditLog } from '../models/AuditLog';
import { PeerReview } from '../models/PeerReview';
import { hashPassword } from '../utils/hash';
import { hashToken } from '../utils/token';
import { logger } from '../config/logger';

export const seedDatabase = async () => {
  logger.info('--- Starting SUVIDHA Database Seed ---');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Course.deleteMany({}),
    Subject.deleteMany({}),
    Feedback.deleteMany({}),
    Grievance.deleteMany({}),
    GrievanceUpdate.deleteMany({}),
    Announcement.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
    PeerReview.deleteMany({}),
  ]);

  logger.info('Cleared existing collections.');

  // 1. Create Departments
  const deptCSE = await Department.create({
    name: 'Computer Science & Engineering',
    code: 'CSE',
    description: 'Department of Computer Science & Engineering and Information Technology',
    isActive: true,
  });

  const deptECE = await Department.create({
    name: 'Electronics & Communication Engineering',
    code: 'ECE',
    description: 'Department of Electronics & Communication Engineering',
    isActive: true,
  });

  const deptME = await Department.create({
    name: 'Mechanical Engineering',
    code: 'ME',
    description: 'Department of Mechanical & Automation Engineering',
    isActive: true,
  });

  const deptCivil = await Department.create({
    name: 'Civil Engineering',
    code: 'CE',
    description: 'Department of Civil & Infrastructure Engineering',
    isActive: true,
  });

  logger.info('Created 4 Departments.');

  // 2. Create Courses
  const courseBTCSE = await Course.create({
    name: 'B.Tech in Computer Science & Engineering',
    code: 'BT-CSE',
    department: deptCSE._id,
    durationYears: 4,
    totalSemesters: 8,
  });

  const courseBTECE = await Course.create({
    name: 'B.Tech in Electronics & Communication',
    code: 'BT-ECE',
    department: deptECE._id,
    durationYears: 4,
    totalSemesters: 8,
  });

  logger.info('Created Courses.');

  // 3. Create Users (Admin, Coordinator, Faculty, Students)
  const defaultPassword = await hashPassword('Password@123');
  const adminPassword = await hashPassword('Admin@12345');
  const facultyPassword = await hashPassword('Faculty@12345');
  const studentPassword = await hashPassword('Student@12345');

  // Admin
  const adminUser = await User.create({
    name: 'Prof. Rajeshwar Sen',
    email: 'admin@suvidha.edu',
    password: adminPassword,
    role: 'admin',
    isEmailVerified: true,
    isActive: true,
  });

  // Coordinator
  const coordCSE = await User.create({
    name: 'Dr. Ananya Mukherjee',
    email: 'coordinator.cse@suvidha.edu',
    password: facultyPassword,
    role: 'coordinator',
    department: deptCSE._id,
    facultyId: 'COORD-CSE-01',
    isEmailVerified: true,
    isActive: true,
  });

  // Faculty Members
  const facultyVerma = await User.create({
    name: 'Dr. Ramesh Verma',
    email: 'faculty.verma@suvidha.edu',
    password: facultyPassword,
    role: 'faculty',
    department: deptCSE._id,
    facultyId: 'FAC-CSE-01',
    isEmailVerified: true,
    isActive: true,
  });

  const facultyGupta = await User.create({
    name: 'Prof. Priya Gupta',
    email: 'faculty.gupta@suvidha.edu',
    password: facultyPassword,
    role: 'faculty',
    department: deptCSE._id,
    facultyId: 'FAC-CSE-02',
    isEmailVerified: true,
    isActive: true,
  });

  const facultySharma = await User.create({
    name: 'Dr. Arvind Sharma',
    email: 'faculty.sharma@suvidha.edu',
    password: facultyPassword,
    role: 'faculty',
    department: deptECE._id,
    facultyId: 'FAC-ECE-01',
    isEmailVerified: true,
    isActive: true,
  });

  // Update Coordinator reference in Department
  deptCSE.coordinator = coordCSE._id as any;
  deptCSE.headOfDepartment = facultyVerma._id as any;
  await deptCSE.save();

  // Students
  const studentAarav = await User.create({
    name: 'Aarav Sharma',
    email: 'aarav.sharma@suvidha.edu',
    password: studentPassword,
    role: 'student',
    studentId: '2023CS0101',
    department: deptCSE._id,
    course: courseBTCSE._id,
    semester: 7,
    isEmailVerified: true,
    isActive: true,
  });

  const studentDiya = await User.create({
    name: 'Diya Patel',
    email: 'diya.patel@suvidha.edu',
    password: studentPassword,
    role: 'student',
    studentId: '2023CS0142',
    department: deptCSE._id,
    course: courseBTCSE._id,
    semester: 7,
    isEmailVerified: true,
    isActive: true,
  });

  const studentKabir = await User.create({
    name: 'Kabir Joshi',
    email: 'kabir.joshi@suvidha.edu',
    password: studentPassword,
    role: 'student',
    studentId: '2023CS0105',
    department: deptCSE._id,
    course: courseBTCSE._id,
    semester: 7,
    isEmailVerified: true,
    isActive: true,
  });

  const studentAnanya = await User.create({
    name: 'Ananya Roy',
    email: 'ananya.roy@suvidha.edu',
    password: studentPassword,
    role: 'student',
    studentId: '2023CS0112',
    department: deptCSE._id,
    course: courseBTCSE._id,
    semester: 7,
    isEmailVerified: true,
    isActive: true,
  });

  const studentVikram = await User.create({
    name: 'Vikram Singh',
    email: 'vikram.singh@suvidha.edu',
    password: studentPassword,
    role: 'student',
    studentId: '2023CS0120',
    department: deptCSE._id,
    course: courseBTCSE._id,
    semester: 7,
    isEmailVerified: true,
    isActive: true,
  });

  const studentSneha = await User.create({
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@suvidha.edu',
    password: studentPassword,
    role: 'student',
    studentId: '2023CS0128',
    department: deptCSE._id,
    course: courseBTCSE._id,
    semester: 7,
    isEmailVerified: true,
    isActive: true,
  });

  const studentAmit = await User.create({
    name: 'Amit Trivedi',
    email: 'amit.trivedi@suvidha.edu',
    password: studentPassword,
    role: 'student',
    studentId: '2023CS0135',
    department: deptCSE._id,
    course: courseBTCSE._id,
    semester: 7,
    isEmailVerified: true,
    isActive: true,
  });

  const studentNeha = await User.create({
    name: 'Neha Bansal',
    email: 'neha.bansal@suvidha.edu',
    password: studentPassword,
    role: 'student',
    studentId: '2023CS0149',
    department: deptCSE._id,
    course: courseBTCSE._id,
    semester: 7,
    isEmailVerified: true,
    isActive: true,
  });

  const studentRahul = await User.create({
    name: 'Rahul Nair',
    email: 'rahul.nair@suvidha.edu',
    password: studentPassword,
    role: 'student',
    studentId: '2023CS0155',
    department: deptCSE._id,
    course: courseBTCSE._id,
    semester: 7,
    isEmailVerified: true,
    isActive: true,
  });

  const studentDivya = await User.create({
    name: 'Divya Mehra',
    email: 'divya.mehra@suvidha.edu',
    password: studentPassword,
    role: 'student',
    studentId: '2023CS0162',
    department: deptCSE._id,
    course: courseBTCSE._id,
    semester: 7,
    isEmailVerified: true,
    isActive: true,
  });

  const studentRohan = await User.create({
    name: 'Rohan Mehta',
    email: 'rohan.mehta@suvidha.edu',
    password: studentPassword,
    role: 'student',
    studentId: '2024EC0089',
    department: deptECE._id,
    course: courseBTECE._id,
    semester: 5,
    isEmailVerified: true,
    isActive: true,
  });

  logger.info('Created Admin, Coordinator, Faculty, and Students.');

  // 4. Create Subjects
  const subOS = await Subject.create({
    name: 'Operating Systems & Distributed Architecture',
    code: 'CS701',
    department: deptCSE._id,
    course: courseBTCSE._id,
    semester: 7,
    faculty: [facultyVerma._id],
  });

  const subAI = await Subject.create({
    name: 'Artificial Intelligence & Machine Learning',
    code: 'CS702',
    department: deptCSE._id,
    course: courseBTCSE._id,
    semester: 7,
    faculty: [facultyGupta._id],
  });

  const subNetworks = await Subject.create({
    name: 'Computer Networks & Security',
    code: 'CS703',
    department: deptCSE._id,
    course: courseBTCSE._id,
    semester: 7,
    faculty: [facultyVerma._id],
  });

  logger.info('Created Subjects with Faculty linkages.');

  // 5. Create Feedback Records (Identified and Anonymous)
  await Feedback.create([
    {
      referenceNumber: 'FB-2026-A101',
      category: 'faculty_teaching',
      submissionMode: 'identified',
      student: studentAarav._id,
      department: deptCSE._id,
      course: courseBTCSE._id,
      subject: subOS._id,
      faculty: facultyVerma._id,
      overallRating: 5,
      criteriaRatings: [
        { label: 'Lecture Clarity', score: 5 },
        { label: 'Subject Knowledge', score: 5 },
        { label: 'Fairness in Grading', score: 4 },
      ],
      comments: 'Dr. Verma explains core kernel synchronization and deadlock algorithms exceptionally well with hands-on Linux examples.',
      suggestions: 'Would love if we could have a dedicated workshop on xv6 kernel compilation.',
      sentiment: 'positive',
      tags: ['academics', 'teaching'],
      status: 'reviewed',
    },
    {
      referenceNumber: 'FB-2026-A102',
      category: 'it_services',
      submissionMode: 'identified',
      student: studentDiya._id,
      department: deptCSE._id,
      facility: 'Campus Wi-Fi & CS Labs',
      overallRating: 2,
      criteriaRatings: [
        { label: 'Connection Speed', score: 2 },
        { label: 'Coverage in Block B', score: 1 },
      ],
      comments: 'Campus Wi-Fi keeps disconnecting frequently in 3rd floor Computer Science labs during afternoon practical sessions.',
      suggestions: 'Install additional high-density access points in Block B corridors.',
      sentiment: 'negative',
      tags: ['it_wifi'],
      status: 'submitted',
    },
    {
      referenceNumber: 'FB-2026-A103',
      category: 'library_laboratory',
      submissionMode: 'anonymous',
      student: null, // Strict anonymity: student identity is completely decoupled
      department: deptCSE._id,
      facility: 'Central Library',
      overallRating: 4,
      criteriaRatings: [
        { label: 'Resource Availability', score: 4 },
        { label: 'Reading Ambience', score: 5 },
      ],
      comments: 'The 24/7 digital library terminal setup is great for exam preparations.',
      suggestions: 'More physical copies of reference textbooks for Distributed Systems would be appreciated.',
      sentiment: 'positive',
      tags: ['library'],
      status: 'reviewed',
    },
    {
      referenceNumber: 'FB-2026-A104',
      category: 'hostel_mess',
      submissionMode: 'anonymous',
      student: null,
      facility: 'Boys Hostel Mess 2',
      overallRating: 2,
      criteriaRatings: [
        { label: 'Food Hygiene', score: 2 },
        { label: 'Menu Variety', score: 2 },
      ],
      comments: 'Canteen and mess food quality has deteriorated this month, food was lukewarm and drinking water cooler was leaking.',
      suggestions: 'Regular food quality inspections by the student mess committee.',
      sentiment: 'negative',
      tags: ['mess_food', 'hygiene'],
      status: 'submitted',
    },
    {
      referenceNumber: 'FB-2026-A105',
      category: 'faculty_teaching',
      submissionMode: 'identified',
      student: studentDiya._id,
      department: deptCSE._id,
      course: courseBTCSE._id,
      subject: subAI._id,
      faculty: facultyGupta._id,
      overallRating: 5,
      criteriaRatings: [
        { label: 'Practical Demonstrations', score: 5 },
        { label: 'Punctuality', score: 5 },
      ],
      comments: 'Prof. Gupta provides interactive PyTorch notebooks for every lecture. Very engaging teaching methodology!',
      sentiment: 'positive',
      tags: ['academics'],
      status: 'reviewed',
    },
    {
      referenceNumber: 'FB-2026-A106',
      category: 'faculty_teaching',
      submissionMode: 'anonymous',
      student: null,
      department: deptCSE._id,
      course: courseBTCSE._id,
      subject: subOS._id,
      faculty: facultyVerma._id,
      overallRating: 4,
      criteriaRatings: [
        { label: 'Teaching Quality', score: 4 },
      ],
      comments: 'Great lectures on memory management and virtual memory paging.',
      sentiment: 'positive',
      tags: ['academics'],
      status: 'reviewed',
    },
  ]);

  logger.info('Created 6 Sample Feedback records.');

  // 6. Create Grievances & Updates
  // Grievance 1: In Progress, Assigned to Faculty Verma
  const grv1 = await Grievance.create({
    referenceNumber: 'GRV-2026-1001',
    title: 'Faulty FPGA Development Boards in Embedded Lab 402',
    description: 'During our Embedded Systems lab on Monday, 6 out of 10 FPGA kits showed power rail failures and would not connect via JTAG programmers. This is impeding our semester capstone project experiments.',
    category: 'facilities',
    priority: 'high',
    isSensitive: false,
    submissionMode: 'identified',
    student: studentAarav._id,
    department: deptCSE._id,
    assignedTo: facultyVerma._id,
    assignedBy: coordCSE._id,
    assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'in_progress',
    incidentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    location: 'Lab 402, Block B',
    targetResolutionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Active SLA
    attachments: [
      {
        fileName: 'fpga_board_error.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
        fileSize: 450000,
        fileType: 'image/jpeg',
      },
    ],
  });

  await GrievanceUpdate.create([
    {
      grievance: grv1._id,
      author: studentAarav._id,
      authorRole: 'student',
      authorName: 'Aarav Sharma',
      updateType: 'status_change',
      message: 'Grievance registered under Facilities category with HIGH priority.',
      newStatus: 'submitted',
      isInternalOnly: false,
    },
    {
      grievance: grv1._id,
      author: coordCSE._id,
      authorRole: 'coordinator',
      authorName: 'Dr. Ananya Mukherjee (COORDINATOR)',
      updateType: 'assignment',
      message: 'Assigned to Lab In-charge Dr. Ramesh Verma for component inspection and repair requisition.',
      previousStatus: 'submitted',
      newStatus: 'assigned',
      isInternalOnly: false,
    },
    {
      grievance: grv1._id,
      author: facultyVerma._id,
      authorRole: 'faculty',
      authorName: 'Dr. Ramesh Verma (FACULTY)',
      updateType: 'internal_note',
      message: 'Inspected the kits. Power supply capacitors on 4 units require bench replacement. Order requisition placed with vendor.',
      isInternalOnly: true, // Internal staff note
    },
    {
      grievance: grv1._id,
      author: facultyVerma._id,
      authorRole: 'faculty',
      authorName: 'Dr. Ramesh Verma (FACULTY)',
      updateType: 'official_response',
      message: 'We have tested the kits and replacement voltage regulators have been requested from the central stores. Expected to be operational by Thursday.',
      previousStatus: 'assigned',
      newStatus: 'in_progress',
      isInternalOnly: false,
    },
  ]);

  // Grievance 2: Resolved
  const grv2 = await Grievance.create({
    referenceNumber: 'GRV-2026-1002',
    title: 'Discrepancy in Mid-Semester Exam Attendance Record',
    description: 'My attendance for the CS703 Mid-Term examination was mistakenly marked absent on the student portal even though I was present and submitted my answer sheet in Room 304.',
    category: 'examination',
    priority: 'medium',
    isSensitive: false,
    submissionMode: 'identified',
    student: studentDiya._id,
    department: deptCSE._id,
    assignedTo: coordCSE._id,
    status: 'resolved',
    incidentDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    location: 'Exam Hall 304',
    targetResolutionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    resolutionSummary: 'Verified physical signature sheet from Exam Hall 304. Attendance corrected to Present in the academic portal records.',
  });

  await GrievanceUpdate.create([
    {
      grievance: grv2._id,
      author: coordCSE._id,
      authorRole: 'coordinator',
      authorName: 'Dr. Ananya Mukherjee (COORDINATOR)',
      updateType: 'official_response',
      message: 'Physical examination attendance registers have been verified with invigilator sign-off. Portal records updated to Present. Issue resolved.',
      previousStatus: 'under_review',
      newStatus: 'resolved',
      isInternalOnly: false,
    },
  ]);

  // Grievance 3: Anonymous Grievance with Tracking Token
  const demoRawToken = 'trk_demo_token_1234567890abcdef';
  const demoTokenHash = hashToken(demoRawToken);

  const grv3 = await Grievance.create({
    referenceNumber: 'GRV-2026-1003',
    title: 'Non-functional Water Purifier and Water Cooler on 2nd Floor',
    description: 'The drinking water dispenser on the 2nd floor near Room 215 has an unpleasant odor and the cooling unit is not functioning for the past two weeks.',
    category: 'facilities',
    priority: 'low',
    isSensitive: false,
    submissionMode: 'anonymous',
    student: null, // Zero account linkage
    anonymousTrackingTokenHash: demoTokenHash,
    department: deptCSE._id,
    status: 'submitted',
    targetResolutionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    location: '2nd Floor, Block B near Room 215',
  });

  await GrievanceUpdate.create({
    grievance: grv3._id,
    author: null,
    authorRole: 'anonymous_student',
    authorName: 'Anonymous Student',
    updateType: 'status_change',
    message: 'Anonymous grievance filed with system-generated tracking token.',
    newStatus: 'submitted',
    isInternalOnly: false,
  });

  // Grievance 4: Overdue Grievance to demonstrate SLA warning
  await Grievance.create({
    referenceNumber: 'GRV-2026-1004',
    title: 'Broken Projector in Lecture Hall LH-102',
    description: 'The overhead HDMI projector keeps flickering and shuts down after 10 minutes of display during morning lectures.',
    category: 'technical',
    priority: 'critical',
    isSensitive: false,
    submissionMode: 'identified',
    student: studentRohan._id,
    department: deptECE._id,
    assignedTo: facultySharma._id,
    status: 'assigned',
    targetResolutionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Overdue!
    location: 'Lecture Hall LH-102',
  });

  logger.info('Created 4 Grievances with status history, SLA tracking, and updates.');

  // 7. Announcements
  await Announcement.create([
    {
      title: 'End-Semester Course Evaluation & Feedback Window Open',
      content: 'All undergraduate and postgraduate students are requested to complete the semester feedback for all registered subjects before November 5th. Your feedback directly shapes academic improvements.',
      priority: 'important',
      category: 'academic',
      targetRole: 'all',
      author: adminUser._id,
      isActive: true,
    },
    {
      title: 'Scheduled Campus Network Maintenance Notice',
      content: 'Campus Wi-Fi and Intranet will undergo planned router firmware upgrades on Saturday from 11:00 PM to 03:00 AM. Intermittent downtime is expected.',
      priority: 'normal',
      category: 'maintenance',
      targetRole: 'all',
      author: adminUser._id,
      isActive: true,
    },
  ]);

  // 8. Notifications
  await Notification.create([
    {
      recipient: studentAarav._id,
      title: 'Grievance Update: #GRV-2026-1001',
      message: 'Dr. Ramesh Verma updated your grievance status to IN PROGRESS.',
      type: 'grievance',
      link: '/student/submissions?tab=grievances&ref=GRV-2026-1001',
      isRead: false,
    },
    {
      recipient: studentDiya._id,
      title: 'Grievance Resolved: #GRV-2026-1002',
      message: 'Your exam attendance discrepancy grievance has been successfully resolved.',
      type: 'grievance',
      link: '/student/submissions?tab=grievances&ref=GRV-2026-1002',
      isRead: true,
    },
  ]);

  // 9. Peer Reviews (360° Classmate Evaluations)
  await PeerReview.create([
    {
      reviewer: studentDiya._id,
      reviewee: studentAarav._id,
      department: deptCSE._id,
      course: courseBTCSE._id,
      semester: 7,
      academicYear: '2025-2026',
      ratings: { teamwork: 5, communication: 4, problemSolving: 5, punctuality: 4, overall: 4.5 },
      strengths: ['Great Leader', 'Quick Problem Solver', 'Reliable Team Member'],
      areasForImprovement: 'Can share project documentation earlier so team members have more time to review.',
      comments: 'Aarav is an awesome project partner. He debugged our distributed systems deployment in no time.',
      isAnonymous: false,
      status: 'active',
    },
    {
      reviewer: studentKabir._id,
      reviewee: studentAarav._id,
      department: deptCSE._id,
      course: courseBTCSE._id,
      semester: 7,
      academicYear: '2025-2026',
      ratings: { teamwork: 5, communication: 5, problemSolving: 4, punctuality: 5, overall: 4.8 },
      strengths: ['Great Collaborator', 'Supportive', 'Punctual'],
      areasForImprovement: 'None really, absolute pleasure working together!',
      comments: 'Very punctual and takes accountability for tasks during practical evaluations.',
      isAnonymous: false,
      status: 'active',
    },
    {
      reviewer: studentAnanya._id,
      reviewee: studentAarav._id,
      department: deptCSE._id,
      course: courseBTCSE._id,
      semester: 7,
      academicYear: '2025-2026',
      ratings: { teamwork: 4, communication: 4, problemSolving: 5, punctuality: 4, overall: 4.3 },
      strengths: ['Quick Problem Solver', 'Innovative Ideas', 'Technically Strong'],
      areasForImprovement: 'Try to encourage quieter teammates to speak up during brainstorming sessions.',
      comments: 'Strong technical skills and always willing to help when others are stuck on algorithms.',
      isAnonymous: true,
      status: 'active',
    },
    {
      reviewer: studentVikram._id,
      reviewee: studentAarav._id,
      department: deptCSE._id,
      course: courseBTCSE._id,
      semester: 7,
      academicYear: '2025-2026',
      ratings: { teamwork: 5, communication: 4, problemSolving: 5, punctuality: 5, overall: 4.8 },
      strengths: ['Technically Strong', 'Great Leader', 'Reliable Team Member'],
      comments: 'Handled the hardest backend module effortlessly in our lab project.',
      isAnonymous: true,
      status: 'active',
    },
    {
      reviewer: studentSneha._id,
      reviewee: studentAarav._id,
      department: deptCSE._id,
      course: courseBTCSE._id,
      semester: 7,
      academicYear: '2025-2026',
      ratings: { teamwork: 4, communication: 5, problemSolving: 4, punctuality: 4, overall: 4.3 },
      strengths: ['Active Listener', 'Supportive', 'Helpful'],
      comments: 'Always approachable and explains complex concepts with patience.',
      isAnonymous: true,
      status: 'active',
    },
    {
      reviewer: studentAarav._id,
      reviewee: studentDiya._id,
      department: deptCSE._id,
      course: courseBTCSE._id,
      semester: 7,
      academicYear: '2025-2026',
      ratings: { teamwork: 5, communication: 5, problemSolving: 4, punctuality: 5, overall: 4.8 },
      strengths: ['Great Collaborator', 'Organized', 'Punctual'],
      comments: 'Diya kept our project sprint deadlines completely organized and on schedule.',
      isAnonymous: true,
      status: 'active',
    },
    {
      reviewer: studentAarav._id,
      reviewee: studentKabir._id,
      department: deptCSE._id,
      course: courseBTCSE._id,
      semester: 7,
      academicYear: '2025-2026',
      ratings: { teamwork: 4, communication: 4, problemSolving: 5, punctuality: 4, overall: 4.3 },
      strengths: ['Quick Problem Solver', 'Technically Strong'],
      comments: 'Kabir is brilliant at frontend UI styling and database design.',
      isAnonymous: true,
      status: 'active',
    },
  ]);

  // 10. Audit Logs
  await AuditLog.create([
    {
      user: adminUser._id,
      action: 'SYSTEM_BOOTSTRAP',
      category: 'admin',
      ipAddress: '127.0.0.1',
      userAgent: 'Suvidha Initializer',
      details: { environment: 'development', version: '1.0.0' },
    },
    {
      user: studentAarav._id,
      action: 'USER_LOGIN_SUCCESS',
      category: 'auth',
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: { email: studentAarav.email, role: 'student' },
    },
  ]);

  logger.info('====================================================');
  logger.info('  SUVIDHA SEED DATA INITIALIZED SUCCESSFULLY!       ');
  logger.info('====================================================');
  logger.info('DEMO ACCOUNTS READY FOR EVALUATION:');
  logger.info('  Student:     aarav.sharma@suvidha.edu       / Student@12345');
  logger.info('  Student 2:   diya.patel@suvidha.edu         / Student@12345');
  logger.info('  Faculty:     faculty.verma@suvidha.edu      / Faculty@12345');
  logger.info('  Coordinator: coordinator.cse@suvidha.edu    / Faculty@12345');
  logger.info('  Admin:       admin@suvidha.edu              / Admin@12345');
  logger.info('ANONYMOUS TICKET TRACKING TOKEN:');
  logger.info(`  Token:       ${demoRawToken}`);
  logger.info('====================================================');
};

// If run directly via `npm run seed`
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      logger.error('Seed script error:', err);
      process.exit(1);
    }
  })();
}
