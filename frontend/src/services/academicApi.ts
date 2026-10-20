import { api } from './api';
import { Department, Course, Subject } from '../types';

export const academicApi = {
  getDepartments: async (): Promise<Department[]> => {
    const res = await api.get('/academic/departments');
    return res.data.data.departments;
  },

  getCourses: async (departmentId?: string): Promise<Course[]> => {
    const res = await api.get('/academic/courses', { params: { departmentId } });
    return res.data.data.courses;
  },

  getSubjects: async (params?: { departmentId?: string; courseId?: string; semester?: number }): Promise<Subject[]> => {
    const res = await api.get('/academic/subjects', { params });
    return res.data.data.subjects;
  },

  getFacultyList: async (departmentId?: string): Promise<any[]> => {
    const res = await api.get('/academic/faculty-list', { params: { departmentId } });
    return res.data.data.facultyMembers;
  },

  createDepartment: async (data: any): Promise<Department> => {
    const res = await api.post('/academic/departments', data);
    return res.data.data.department;
  },

  createCourse: async (data: any): Promise<Course> => {
    const res = await api.post('/academic/courses', data);
    return res.data.data.course;
  },

  createSubject: async (data: any): Promise<Subject> => {
    const res = await api.post('/academic/subjects', data);
    return res.data.data.subject;
  },
};
