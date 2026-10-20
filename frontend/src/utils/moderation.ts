/**
 * Frontend Content Moderation & Abuse Prevention Utility
 */

const ABUSIVE_PATTERNS = [
  'fuck', 'fucker', 'fucking', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick',
  'dickhead', 'pussy', 'whore', 'slut', 'moron', 'idiot', 'retard', 'stupid', 'dumbass',
  'loser', 'scumbag', 'jackass', 'bullshit', 'prick', 'douche', 'douchebag',

  // Common Hindi / Hinglish abusive terms
  'madarchod', 'mc', 'bhenchod', 'bc', 'bhosdike', 'bhosadi', 'chutiya', 'chutiye',
  'gandu', 'gaandu', 'harami', 'haramkhor', 'kutta', 'kaminey', 'kamina', 'randi',
  'lauda', 'loda', 'lode', 'lund', 'choot', 'gaand', 'tatte', 'saala', 'kamina',
  'kamine', 'hijra', 'chod', 'chodu', 'bhadwa', 'bhadwe', 'jhaatu', 'jhatu',

  // Harassment
  'kill yourself', 'die', 'threat', 'kys', 'hate you', 'worthless',
];

const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export interface ClientModerationResult {
  hasProfanity: boolean;
  flaggedWord?: string;
  warningMessage?: string;
}

export const checkAbusiveContent = (...texts: (string | undefined | null)[]): ClientModerationResult => {
  const combined = texts
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/\*/g, '');

  for (const pattern of ABUSIVE_PATTERNS) {
    const regex = new RegExp(`(^|\\b|\\s|_)${escapeRegExp(pattern)}(\\b|\\s|_|$)`, 'i');
    if (regex.test(combined)) {
      return {
        hasProfanity: true,
        flaggedWord: pattern,
        warningMessage: `Inappropriate term detected: "${pattern}". Please maintain constructive and respectful communication.`,
      };
    }
  }

  return { hasProfanity: false };
};
