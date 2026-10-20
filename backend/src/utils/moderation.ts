/**
 * Content Moderation & Profanity Detection Utility
 * Detects abusive, vulgar, derogatory, and inappropriate terms in English and Hinglish
 */

// Normalized list of abusive words, slurs, profanity, and harassment terms
const ABUSIVE_PATTERNS = [
  // Common English profanities and insults
  'fuck', 'fucker', 'fucking', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick',
  'dickhead', 'pussy', 'whore', 'slut', 'moron', 'idiot', 'retard', 'stupid', 'dumbass',
  'loser', 'scumbag', 'jackass', 'bullshit', 'prick', 'douche', 'douchebag',

  // Common Hindi / Hinglish abusive words and harassment terms
  'madarchod', 'mc', 'bhenchod', 'bc', 'bhosdike', 'bhosadi', 'chutiya', 'chutiye',
  'gandu', 'gaandu', 'harami', 'haramkhor', 'kutta', 'kaminey', 'kamina', 'randi',
  'lauda', 'loda', 'lode', 'lund', 'choot', 'gaand', 'tatte', 'saala', 'kamina',
  'kamine', 'hijra', 'chod', 'chodu', 'bhadwa', 'bhadwe', 'jhaatu', 'jhatu',

  // Hate speech & harassment
  'kill yourself', 'die', 'threat', 'kys', 'hate you', 'worthless',
];

// Compile regex with word boundaries and leetspeak substitutions
const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export interface ModerationResult {
  isClean: boolean;
  flaggedWord?: string;
  reason?: string;
}

/**
 * Scans one or more text inputs for abusive or prohibited terms
 */
export const checkContentModeration = (...texts: (string | undefined | null)[]): ModerationResult => {
  const combinedText = texts
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    // normalize common leetspeak substitutions: 0 -> o, 1 -> i, 3 -> e, 4 -> a, @ -> a, $ -> s, etc.
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/\*/g, '');

  for (const pattern of ABUSIVE_PATTERNS) {
    // Regex looking for whole word or phrase boundaries
    const regex = new RegExp(`(^|\\b|\\s|_)${escapeRegExp(pattern)}(\\b|\\s|_|$)`, 'i');
    if (regex.test(combinedText)) {
      return {
        isClean: false,
        flaggedWord: pattern,
        reason: `Your review contains inappropriate or abusive language ("${pattern}"). Please ensure feedback is respectful, constructive, and follows campus code of conduct.`,
      };
    }
  }

  return { isClean: true };
};
