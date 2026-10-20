import React from 'react';
import { MultiStepFeedbackForm } from '../../components/feedback/MultiStepFeedbackForm';

export const SubmitFeedbackPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Submit Academic & Campus Feedback
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Share your ratings and constructive reviews to enhance teaching and facilities.
        </p>
      </div>
      <MultiStepFeedbackForm />
    </div>
  );
};
