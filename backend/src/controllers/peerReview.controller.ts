import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { peerReviewService } from '../services/peerReview.service';

export class PeerReviewController {
  async getClassmates(req: AuthenticatedRequest, res: Response) {
    const result = await peerReviewService.getClassmates(req.user!);
    res.json({
      success: true,
      data: result,
    });
  }

  async submitPeerReview(req: AuthenticatedRequest, res: Response) {
    const review = await peerReviewService.submitPeerReview(req.user!, req.body);
    res.status(201).json({
      success: true,
      message: 'Peer review recorded successfully',
      data: review,
    });
  }

  async getMyReceivedFeedback(req: AuthenticatedRequest, res: Response) {
    const data = await peerReviewService.getMyReceivedFeedback(req.user!._id.toString());
    res.json({
      success: true,
      data,
    });
  }

  async getMyGivenReviews(req: AuthenticatedRequest, res: Response) {
    const reviews = await peerReviewService.getMyGivenReviews(req.user!._id.toString());
    res.json({
      success: true,
      data: reviews,
    });
  }

  async getClassOverview(req: AuthenticatedRequest, res: Response) {
    const { departmentId, courseId, semester } = req.query;
    const semNumber = parseInt(semester as string, 10) || 7;

    const data = await peerReviewService.getClassOverview(
      departmentId as string,
      courseId as string,
      semNumber
    );

    res.json({
      success: true,
      data,
    });
  }
}

export const peerReviewController = new PeerReviewController();
