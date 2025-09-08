import { renderHook } from '@testing-library/react';
import { useMilestoneCommunications } from '../useMilestoneCommunications';

describe('useMilestoneCommunications Edge Cases', () => {
  const mockScheduleCommunication = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('furthestOnly rule (currently missing implementation)', () => {
    const rulesWithFurthestOnly = {
      milestoneUnlocked: {
        enabled: true,
        days: 3,
        applyToChapters: true,
        applyToSessions: true,
        ignoreOptional: false,
        furthestOnly: true
      }
    };

    it('should only schedule communication for furthest milestone when furthestOnly is true', async () => {
      const { result } = renderHook(() => 
        useMilestoneCommunications(rulesWithFurthestOnly, mockScheduleCommunication)
      );

      // Simulating multiple milestones unlocking simultaneously
      const milestone1 = { id: 1, name: 'Milestone 1', type: 'milestone', optional: false, position: 1 };
      const milestone2 = { id: 2, name: 'Milestone 2', type: 'milestone', optional: false, position: 2 };
      const milestone3 = { id: 3, name: 'Milestone 3', type: 'milestone', optional: false, position: 3 };

      // Unlock multiple milestones in rapid succession (simulating batch unlock)
      result.current.handleMilestoneStateChange(milestone1, 'locked', 'unlocked');
      result.current.handleMilestoneStateChange(milestone2, 'locked', 'unlocked');
      result.current.handleMilestoneStateChange(milestone3, 'locked', 'unlocked');

      // Wait for the setTimeout delay to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      // With furthestOnly implemented, should only be called once for milestone 3
      expect(mockScheduleCommunication).toHaveBeenCalledTimes(1);
      expect(mockScheduleCommunication).toHaveBeenCalledWith({
        rule: 'milestoneUnlocked',
        milestoneId: 3,
        milestoneName: 'Milestone 3',
        daysOffset: 3
      });
    });

    it('should schedule communication for each milestone when furthestOnly is false', () => {
      const rulesWithoutFurthestOnly = {
        ...rulesWithFurthestOnly,
        milestoneUnlocked: {
          ...rulesWithFurthestOnly.milestoneUnlocked,
          furthestOnly: false
        }
      };

      const { result } = renderHook(() => 
        useMilestoneCommunications(rulesWithoutFurthestOnly, mockScheduleCommunication)
      );

      const milestone1 = { id: 1, name: 'Milestone 1', type: 'milestone', optional: false, position: 1 };
      const milestone2 = { id: 2, name: 'Milestone 2', type: 'milestone', optional: false, position: 2 };

      result.current.handleMilestoneStateChange(milestone1, 'locked', 'unlocked');
      result.current.handleMilestoneStateChange(milestone2, 'locked', 'unlocked');

      expect(mockScheduleCommunication).toHaveBeenCalledTimes(2);
    });
  });

  describe('Complex state transition scenarios', () => {
    const defaultRules = {
      milestoneUnlocked: {
        enabled: true,
        days: 3,
        applyToChapters: true,
        applyToSessions: false,
        ignoreOptional: true,
        furthestOnly: false
      }
    };

    it('should handle transition from completed to unlocked', () => {
      const { result } = renderHook(() => 
        useMilestoneCommunications(defaultRules, mockScheduleCommunication)
      );

      const milestone = {
        id: 1,
        name: 'Test Milestone',
        type: 'milestone',
        optional: false
      };

      // This should trigger communication (completed -> unlocked is valid unlock)
      result.current.handleMilestoneStateChange(milestone, 'completed', 'unlocked');

      expect(mockScheduleCommunication).toHaveBeenCalledWith({
        rule: 'milestoneUnlocked',
        milestoneId: 1,
        milestoneName: 'Test Milestone',
        daysOffset: 3
      });
    });

    it('should not trigger on unlocked to unlocked transition', () => {
      const { result } = renderHook(() => 
        useMilestoneCommunications(defaultRules, mockScheduleCommunication)
      );

      const milestone = {
        id: 1,
        name: 'Test Milestone',
        type: 'milestone',
        optional: false
      };

      result.current.handleMilestoneStateChange(milestone, 'unlocked', 'unlocked');

      expect(mockScheduleCommunication).not.toHaveBeenCalled();
    });

    it('should handle invalid state transitions gracefully', () => {
      const { result } = renderHook(() => 
        useMilestoneCommunications(defaultRules, mockScheduleCommunication)
      );

      const milestone = {
        id: 1,
        name: 'Test Milestone',
        type: 'milestone',
        optional: false
      };

      // Invalid state values
      expect(() => {
        result.current.handleMilestoneStateChange(milestone, 'invalid', 'unlocked');
      }).not.toThrow();

      expect(() => {
        result.current.handleMilestoneStateChange(milestone, 'locked', 'invalid');
      }).not.toThrow();

      // Should not trigger communication for invalid transitions
      expect(mockScheduleCommunication).toHaveBeenCalledTimes(1); // Only the first one with valid 'unlocked' new state
    });
  });

  describe('Milestone type filtering edge cases', () => {
    it('should handle undefined milestone type', () => {
      const rules = {
        milestoneUnlocked: {
          enabled: true,
          days: 3,
          applyToChapters: true,
          applyToSessions: false,
          ignoreOptional: false,
          furthestOnly: false
        }
      };

      const { result } = renderHook(() => 
        useMilestoneCommunications(rules, mockScheduleCommunication)
      );

      const milestoneWithoutType = {
        id: 1,
        name: 'Test Milestone',
        optional: false
        // type is undefined
      };

      result.current.handleMilestoneStateChange(milestoneWithoutType, 'locked', 'unlocked');

      // Should default to 'applyToChapters' behavior when type is undefined
      expect(mockScheduleCommunication).toHaveBeenCalled();
    });

    it('should handle unknown milestone types', () => {
      const rules = {
        milestoneUnlocked: {
          enabled: true,
          days: 3,
          applyToChapters: false,
          applyToSessions: false,
          ignoreOptional: false,
          furthestOnly: false
        }
      };

      const { result } = renderHook(() => 
        useMilestoneCommunications(rules, mockScheduleCommunication)
      );

      const milestoneWithUnknownType = {
        id: 1,
        name: 'Test Milestone',
        type: 'unknown_type',
        optional: false
      };

      result.current.handleMilestoneStateChange(milestoneWithUnknownType, 'locked', 'unlocked');

      // Should default to 'applyToChapters' for unknown types
      expect(mockScheduleCommunication).not.toHaveBeenCalled();
    });
  });

  describe('Configuration edge cases', () => {
    it('should handle missing rule configuration gracefully', () => {
      const incompleteRules = {
        // milestoneUnlocked is missing
      };

      const { result } = renderHook(() => 
        useMilestoneCommunications(incompleteRules, mockScheduleCommunication)
      );

      const milestone = {
        id: 1,
        name: 'Test Milestone',
        type: 'milestone',
        optional: false
      };

      // The error should occur when the function is called, not when the hook is created
      expect(() => {
        result.current.handleMilestoneStateChange(milestone, 'locked', 'unlocked');
      }).toThrow('Missing required milestoneUnlocked configuration in rules');
    });

    it('should handle partial rule configuration', () => {
      const partialRules = {
        milestoneUnlocked: {
          enabled: true
          // days, applyToChapters, etc. are missing
        }
      };

      const { result } = renderHook(() => 
        useMilestoneCommunications(partialRules, mockScheduleCommunication)
      );

      const milestone = {
        id: 1,
        name: 'Test Milestone',
        type: 'milestone',
        optional: false
      };

      // Should handle missing properties gracefully
      expect(() => {
        result.current.handleMilestoneStateChange(milestone, 'locked', 'unlocked');
      }).not.toThrow();
    });

    it('should handle zero days offset', () => {
      const zeroDaysRules = {
        milestoneUnlocked: {
          enabled: true,
          days: 0,
          applyToChapters: true,
          applyToSessions: false,
          ignoreOptional: false,
          furthestOnly: false
        }
      };

      const { result } = renderHook(() => 
        useMilestoneCommunications(zeroDaysRules, mockScheduleCommunication)
      );

      const milestone = {
        id: 1,
        name: 'Test Milestone',
        type: 'milestone',
        optional: false
      };

      result.current.handleMilestoneStateChange(milestone, 'locked', 'unlocked');

      expect(mockScheduleCommunication).toHaveBeenCalledWith({
        rule: 'milestoneUnlocked',
        milestoneId: 1,
        milestoneName: 'Test Milestone',
        daysOffset: 0
      });
    });

    it('should handle negative days offset', () => {
      const negativeDaysRules = {
        milestoneUnlocked: {
          enabled: true,
          days: -5,
          applyToChapters: true,
          applyToSessions: false,
          ignoreOptional: false,
          furthestOnly: false
        }
      };

      const { result } = renderHook(() => 
        useMilestoneCommunications(negativeDaysRules, mockScheduleCommunication)
      );

      const milestone = {
        id: 1,
        name: 'Test Milestone',
        type: 'milestone',
        optional: false
      };

      result.current.handleMilestoneStateChange(milestone, 'locked', 'unlocked');

      expect(mockScheduleCommunication).toHaveBeenCalledWith({
        rule: 'milestoneUnlocked',
        milestoneId: 1,
        milestoneName: 'Test Milestone',
        daysOffset: -5
      });
    });
  });

  describe('Milestone data integrity', () => {
    const defaultRules = {
      milestoneUnlocked: {
        enabled: true,
        days: 3,
        applyToChapters: true,
        applyToSessions: true,
        ignoreOptional: false,
        furthestOnly: false
      }
    };

    it('should handle milestone with missing id', () => {
      const { result } = renderHook(() => 
        useMilestoneCommunications(defaultRules, mockScheduleCommunication)
      );

      const milestoneWithoutId = {
        name: 'Test Milestone',
        type: 'milestone',
        optional: false
        // id is missing
      };

      expect(() => {
        result.current.handleMilestoneStateChange(milestoneWithoutId, 'locked', 'unlocked');
      }).not.toThrow();

      // Should still schedule communication even with missing id
      expect(mockScheduleCommunication).toHaveBeenCalledWith({
        rule: 'milestoneUnlocked',
        milestoneId: undefined,
        milestoneName: 'Test Milestone',
        daysOffset: 3
      });
    });

    it('should handle milestone with missing name', () => {
      const { result } = renderHook(() => 
        useMilestoneCommunications(defaultRules, mockScheduleCommunication)
      );

      const milestoneWithoutName = {
        id: 1,
        type: 'milestone',
        optional: false
        // name is missing
      };

      result.current.handleMilestoneStateChange(milestoneWithoutName, 'locked', 'unlocked');

      expect(mockScheduleCommunication).toHaveBeenCalledWith({
        rule: 'milestoneUnlocked',
        milestoneId: 1,
        milestoneName: undefined,
        daysOffset: 3
      });
    });

    it('should handle null milestone object', () => {
      const { result } = renderHook(() => 
        useMilestoneCommunications(defaultRules, mockScheduleCommunication)
      );

      expect(() => {
        result.current.handleMilestoneStateChange(null, 'locked', 'unlocked');
      }).toThrow(); // This should throw due to null milestone
    });
  });
});