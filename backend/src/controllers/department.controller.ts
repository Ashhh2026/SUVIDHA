import { Request, Response } from 'express';
import { Department } from '../models/Department';
import { Course } from '../models/Course';
import { Subject } from '../models/Subject';
import { User } from '../models/User';

export class DepartmentController {
  static async getAllDepartments(_req: Request, res: Response): Promise<void> {
    try {
      const departments = await Department.find({ isActive: true })
        .populate('headOfDepartment', 'name email')
        .populate('coordinator', 'name email')
        .sort({ name: 1 });

      res.json({ success: true, data: { departments } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createDepartment(req: Request, res: Response): Promise<void> {
    try {
      const department = await Department.create(req.body);
      res.status(201).json({ success: true, message: 'Department created.', data: { department } });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getCourses(req: Request, res: Response): Promise<void> {
    try {
      const { departmentId } = req.query;
      const query: any = { isActive: true };
      if (departmentId) query.department = departmentId;

      const courses = await Course.find(query).populate('department', 'name code').sort({ name: 1 });
      res.json({ success: true, data: { courses } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const course = await Course.create(req.body);
      res.status(201).json({ success: true, message: 'Course created.', data: { course } });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getSubjects(req: Request, res: Response): Promise<void> {
    try {
      const { departmentId, courseId, semester } = req.query;
      const query: any = { isActive: true };
      if (departmentId) query.department = departmentId;
      if (courseId) query.course = courseId;
      if (semester) query.semester = parseInt(semester as string, 10);

      const subjects = await Subject.find(query)
        .populate('faculty', 'name email')
        .populate('department', 'name code')
        .populate('course', 'name code')
        .sort({ name: 1 });

      res.json({ success: true, data: { subjects } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createSubject(req: Request, res: Response): Promise<void> {
    try {
      const subject = await Subject.create(req.body);
      res.status(201).json({ success: true, message: 'Subject created.', data: { subject } });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getFacultyList(req: Request, res: Response): Promise<void> {
    try {
      const { departmentId } = req.query;
      const query: any = { role: { $in: ['faculty', 'coordinator'] }, isActive: true };
      if (departmentId) query.department = departmentId;

      const facultyMembers = await User.find(query).select('name email facultyId department role');
      res.json({ success: true, data: { facultyMembers } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
