import React from 'react';
import { GrievanceForm } from '../../components/grievance/GrievanceForm';

export const SubmitGrievancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Register a Campus Grievance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Report infrastructure failures, exam discrepancies, or administrative problems with official SLA tracking.
        </p>
      </div>
      <GrievanceForm />
    </div>
  );
};
