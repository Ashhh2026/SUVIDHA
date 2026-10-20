import crypto from 'crypto';

export const generateFeedbackReference = (): string => {
  const year = new Date().getFullYear();
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `FB-${year}-${randomSuffix}`;
};

export const generateGrievanceReference = (): string => {
  const year = new Date().getFullYear();
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `GRV-${year}-${randomSuffix}`;
};
