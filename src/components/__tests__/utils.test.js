import { 
  formatDate, 
  formatDateForInput, 
  getStateColor, 
  getStateEmoji, 
  UNLOCK_STRATEGIES 
} from '../utils';

describe('utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toBe('Jan 15, 2024');
    });

    it('should handle different months', () => {
      const date = new Date('2024-12-25');
      const formatted = formatDate(date);
      expect(formatted).toBe('Dec 25, 2024');
    });
  });

  describe('formatDateForInput', () => {
    it('should format date for HTML input', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDateForInput(date);
      expect(formatted).toBe('2024-01-15');
    });

    it('should pad single digit months and days', () => {
      const date = new Date('2024-02-05');
      const formatted = formatDateForInput(date);
      expect(formatted).toBe('2024-02-05');
    });
  });

  describe('getStateColor', () => {
    it('should return correct colors for each state', () => {
      expect(getStateColor('locked')).toBe('bg-red-100 border-red-300');
      expect(getStateColor('unlocked')).toBe('bg-yellow-100 border-yellow-300');
      expect(getStateColor('completed')).toBe('bg-green-100 border-green-300');
      expect(getStateColor('unknown')).toBe('bg-gray-100 border-gray-300');
    });
  });

  describe('getStateEmoji', () => {
    it('should return correct emojis for each state', () => {
      expect(getStateEmoji('locked')).toBe('🔴');
      expect(getStateEmoji('unlocked')).toBe('🟡');
      expect(getStateEmoji('completed')).toBe('🟢');
      expect(getStateEmoji('unknown')).toBe('⚪');
    });
  });

  describe('UNLOCK_STRATEGIES', () => {
    it('should have all expected strategy constants', () => {
      expect(UNLOCK_STRATEGIES.BY_COMPLETION_ONLY).toBe('by_completion_only');
      expect(UNLOCK_STRATEGIES.BY_UNLOCK_AT_ONLY).toBe('by_unlock_at_only');
      expect(UNLOCK_STRATEGIES.BY_UNLOCK_AT_OR_COMPLETION).toBe('by_unlock_at_or_completion');
      expect(UNLOCK_STRATEGIES.BY_UNLOCK_AT_AND_COMPLETION).toBe('by_unlock_at_and_completion');
    });

    it('should have exactly 4 strategies', () => {
      const strategyKeys = Object.keys(UNLOCK_STRATEGIES);
      expect(strategyKeys).toHaveLength(4);
    });
  });
});