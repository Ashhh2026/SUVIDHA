import mongoose from 'mongoose';
import { PeerReview, IPeerReview } from '../models/PeerReview';
import { User, IUser } from '../models/User';
import { Notification } from '../models/Notification';
import { CreatePeerReviewInput } from '../validators/peerReview.validator';
import { ApiError } from '../middleware/errorHandler';
import { checkContentModeration } from '../utils/moderation';

export class PeerReviewService {
  /**
   * Get all classmates in the same department, course, and semester as the authenticated student
   */
  async getClassmates(student: IUser) {
    if (!student.department || !student.course || !student.semester) {
      throw new ApiError(
        'Student profile is incomplete. Department, course, and semester are required to access peer reviews.',
        400
      );
    }

    const classmates = await User.find({
      role: 'student',
      department: student.department,
      course: student.course,
      semester: student.semester,
      _id: { $ne: student._id },
      isActive: true,
    })
      .select('name studentId email')
      .sort({ name: 1 })
      .lean();

    // Fetch existing reviews given by this student
    const existingReviews = await PeerReview.find({
      reviewer: student._id,
      semester: student.semester,
      academicYear: '2025-2026',
    }).lean();

    const reviewMap = new Map<string, any>();
    existingReviews.forEach((rev) => {
      reviewMap.set(rev.reviewee.toString(), rev);
    });

    const enrichedClassmates = classmates.map((mate) => {
      const rev = reviewMap.get(mate._id.toString());
      return {
        _id: mate._id,
        name: mate.name,
        studentId: mate.studentId,
        email: mate.email,
        isReviewed: Boolean(rev),
        review: rev
          ? {
              _id: rev._id,
              ratings: rev.ratings,
              strengths: rev.strengths,
              areasForImprovement: rev.areasForImprovement,
              comments: rev.comments,
              updatedAt: rev.updatedAt,
            }
          : null,
      };
    });

    const totalClassmates = enrichedClassmates.length;
    const totalReviewed = enrichedClassmates.filter((c) => c.isReviewed).length;
    const completionPercentage = totalClassmates > 0 ? Math.round((totalReviewed / totalClassmates) * 100) : 0;

    return {
      classmates: enrichedClassmates,
      totalClassmates,
      totalReviewed,
      completionPercentage,
    };
  }

  /**
   * Submit or update a peer review for a classmate
   */
  async submitPeerReview(reviewer: IUser, input: CreatePeerReviewInput) {
    if (!reviewer.department || !reviewer.course || !reviewer.semester) {
      throw new ApiError('Reviewer profile is missing department or semester information.', 400);
    }

    if (reviewer._id.toString() === input.revieweeId) {
      throw new ApiError('You cannot review yourself.', 400);
    }

    // Verify reviewee belongs to the same class
    const reviewee = await User.findOne({
      _id: input.revieweeId,
      role: 'student',
      department: reviewer.department,
      course: reviewer.course,
      semester: reviewer.semester,
      isActive: true,
    });

    if (!reviewee) {
      throw new ApiError('Classmate not found or not in your designated class section.', 404);
    }

    // Check for abusive or inappropriate words
    const moderation = checkContentModeration(
      input.comments,
      input.areasForImprovement,
      ...(input.strengths || [])
    );
    if (!moderation.isClean) {
      throw new ApiError(moderation.reason!, 400);
    }

    const { teamwork, communication, problemSolving, punctuality } = input.ratings;
    const overall = parseFloat(((teamwork + communication + problemSolving + punctuality) / 4).toFixed(1));

    const isAnon = input.isAnonymous ?? true;

    const updatedReview = await PeerReview.findOneAndUpdate(
      {
        reviewer: reviewer._id,
        reviewee: reviewee._id,
        semester: reviewer.semester,
        academicYear: '2025-2026',
      },
      {
        reviewer: reviewer._id,
        reviewee: reviewee._id,
        department: reviewer.department,
        course: reviewer.course,
        semester: reviewer.semester,
        academicYear: '2025-2026',
        ratings: {
          teamwork,
          communication,
          problemSolving,
          punctuality,
          overall,
        },
        strengths: input.strengths || [],
        areasForImprovement: input.areasForImprovement,
        comments: input.comments,
        isAnonymous: isAnon,
        status: 'active',
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // Notify reviewee
    const notificationMsg = !isAnon
      ? `${reviewer.name} (${reviewer.studentId || 'Classmate'}) submitted peer feedback on your collaboration.`
      : 'A classmate has submitted anonymous feedback on your performance and collaboration.';

    await Notification.create({
      recipient: reviewee._id,
      title: 'New Peer Feedback Received',
      message: notificationMsg,
      type: 'feedback',
      link: '/peer-review',
    });

    return updatedReview;
  }

  /**
   * Get 360° feedback received by the logged in student
   * All individual reviews strictly strip reviewer identity to preserve psychological safety
   */
  async getMyReceivedFeedback(studentId: string) {
    const reviews = await PeerReview.find({
      reviewee: new mongoose.Types.ObjectId(studentId),
      status: 'active',
    })
      .populate('reviewer', 'name studentId')
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        totalReviewsReceived: 0,
        averageRatings: null,
        topStrengths: [],
        feedbackList: [],
      };
    }

    // Calculate aggregated metrics
    const totals = reviews.reduce(
      (acc, r) => {
        acc.teamwork += r.ratings.teamwork;
        acc.communication += r.ratings.communication;
        acc.problemSolving += r.ratings.problemSolving;
        acc.punctuality += r.ratings.punctuality;
        acc.overall += r.ratings.overall;
        return acc;
      },
      { teamwork: 0, communication: 0, problemSolving: 0, punctuality: 0, overall: 0 }
    );

    const averageRatings = {
      teamwork: parseFloat((totals.teamwork / totalReviews).toFixed(1)),
      communication: parseFloat((totals.communication / totalReviews).toFixed(1)),
      problemSolving: parseFloat((totals.problemSolving / totalReviews).toFixed(1)),
      punctuality: parseFloat((totals.punctuality / totalReviews).toFixed(1)),
      overall: parseFloat((totals.overall / totalReviews).toFixed(1)),
    };

    // Aggregate strength tags
    const tagCountMap: Record<string, number> = {};
    reviews.forEach((r) => {
      (r.strengths || []).forEach((tag) => {
        tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
      });
    });

    const topStrengths = Object.entries(tagCountMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    // Feedback list: Respect reviewer anonymity preference
    const feedbackList = reviews.map((r: any) => ({
      _id: r._id,
      ratings: r.ratings,
      strengths: r.strengths,
      areasForImprovement: r.areasForImprovement,
      comments: r.comments,
      createdAt: r.createdAt,
      isAnonymous: Boolean(r.isAnonymous),
      reviewer: r.isAnonymous
        ? null
        : {
            name: r.reviewer?.name || 'Classmate',
            studentId: r.reviewer?.studentId || '',
          },
    }));

    return {
      totalReviewsReceived: totalReviews,
      averageRatings,
      topStrengths,
      feedbackList,
    };
  }

  /**
   * Get reviews given by this student
   */
  async getMyGivenReviews(studentId: string) {
    return PeerReview.find({
      reviewer: new mongoose.Types.ObjectId(studentId),
    })
      .populate('reviewee', 'name studentId')
      .sort({ updatedAt: -1 })
      .lean();
  }

  /**
   * Class overview for Coordinators and Administrators
   */
  async getClassOverview(departmentId: string, courseId: string, semester: number) {
    const students = await User.find({
      role: 'student',
      department: departmentId,
      course: courseId,
      semester,
      isActive: true,
    })
      .select('name studentId email')
      .lean();

    const reviews = await PeerReview.find({
      department: departmentId,
      course: courseId,
      semester,
      status: 'active',
    }).lean();

    const studentStats = students.map((s) => {
      const given = reviews.filter((r) => r.reviewer.toString() === s._id.toString());
      const received = reviews.filter((r) => r.reviewee.toString() === s._id.toString());
      const avgOverall =
        received.length > 0
          ? parseFloat(
              (received.reduce((acc, r) => acc + r.ratings.overall, 0) / received.length).toFixed(1)
            )
          : 0;

      return {
        _id: s._id,
        name: s.name,
        studentId: s.studentId,
        reviewsGiven: given.length,
        reviewsReceived: received.length,
        averageScore: avgOverall,
      };
    });

    const totalStudents = students.length;
    const totalPossible = totalStudents > 1 ? totalStudents * (totalStudents - 1) : 0;
    const totalSubmitted = reviews.length;
    const participationRate = totalPossible > 0 ? Math.round((totalSubmitted / totalPossible) * 100) : 0;

    return {
      totalStudents,
      totalSubmitted,
      totalPossible,
      participationRate,
      studentStats,
    };
  }
}

export const peerReviewService = new PeerReviewService();
