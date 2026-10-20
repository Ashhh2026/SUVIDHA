import { api } from './api';
import { ClassmatesResponse, PeerFeedbackReport } from '../types';

export const peerReviewApi = {
  getClassmates: async (): Promise<ClassmatesResponse> => {
    const res = await api.get('/peer-reviews/classmates');
    return res.data.data;
  },

  submitPeerReview: async (data: {
    revieweeId: string;
    ratings: {
      teamwork: number;
      communication: number;
      problemSolving: number;
      punctuality: number;
    };
    strengths?: string[];
    areasForImprovement?: string;
    comments?: string;
    isAnonymous?: boolean;
  }) => {
    const res = await api.post('/peer-reviews/submit', data);
    return res.data.data;
  },

  getMyReceivedFeedback: async (): Promise<PeerFeedbackReport> => {
    const res = await api.get('/peer-reviews/my-received');
    return res.data.data;
  },

  getMyGivenReviews: async () => {
    const res = await api.get('/peer-reviews/my-given');
    return res.data.data;
  },

  getClassOverview: async (departmentId: string, courseId: string, semester: number) => {
    const res = await api.get('/peer-reviews/class-overview', {
      params: { departmentId, courseId, semester },
    });
    return res.data.data;
  },
};
