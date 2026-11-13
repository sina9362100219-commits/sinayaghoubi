import { describe, expect, it } from 'vitest';
import { estimateReadingMinutes } from '../../src/lib/reading-time';

describe('estimateReadingMinutes', () => {
  it('returns at least one minute for empty content', () => {
    expect(estimateReadingMinutes('')).toBe(1);
  });

  it('counts Persian words and rounds up at the reading threshold', () => {
    expect(estimateReadingMinutes(Array.from({ length: 220 }, () => 'روان').join(' '))).toBe(1);
    expect(estimateReadingMinutes(Array.from({ length: 221 }, () => 'روان').join(' '))).toBe(2);
  });

  it('does not count punctuation as words', () => {
    expect(estimateReadingMinutes('روان، اندیشه!')).toBe(1);
  });
});
