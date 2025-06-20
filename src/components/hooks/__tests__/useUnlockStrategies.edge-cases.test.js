import { renderHook, act } from '@testing-library/react';
import { useUnlockStrategies } from '../useUnlockStrategies';
import { UNLOCK_STRATEGIES } from '../../utils';

describe('useUnlockStrategies Edge Cases', () => {
  const mockOnStateChange = jest.fn();
  let mockSetMilestones;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetMilestones = jest.fn();
  });

  describe('Date boundary edge cases', () => {
    it('should handle date transitions at midnight', () => {
      const milestones = [
        {
          id: 1,
          name: 'Milestone 1',
          optional: false,
          state: 'locked',
          startDate: new Date('2024-01-15T00:00:00.000Z'), // Exactly midnight
          type: 'milestone'
        }
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          milestones, 
          mockSetMilestones, 
          new Date('2024-01-15T00:00:00.001Z'), // 1ms after midnight
          UNLOCK_STRATEGIES.BY_UNLOCK_AT_ONLY, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.updateMilestoneStates(new Date('2024-01-15T00:00:00.001Z'));
      });

      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(milestones);
      
      expect(updatedMilestones[0].state).toBe('unlocked');
    });

    it('should handle end of day boundary correctly', () => {
      const milestones = [
        {
          id: 1,
          name: 'Milestone 1',
          optional: false,
          state: 'locked',
          startDate: new Date('2024-01-16T00:00:00.000Z'), // Next day at midnight
          type: 'milestone'
        }
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          milestones, 
          mockSetMilestones, 
          new Date('2024-01-15T23:59:59.998Z'), // Still previous day
          UNLOCK_STRATEGIES.BY_UNLOCK_AT_ONLY, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.updateMilestoneStates(new Date('2024-01-15T23:59:59.998Z'));
      });

      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(milestones);
      
      // Should still be locked as we're before the start date (different day)
      expect(updatedMilestones[0].state).toBe('locked');
    });
  });

  describe('Complex prerequisite chains with optional milestones', () => {
    it('should handle optional milestones interspersed with required ones', () => {
      const complexMilestones = [
        { id: 1, name: 'Required 1', optional: false, state: 'completed', type: 'milestone' },
        { id: 2, name: 'Optional 1', optional: true, state: 'locked', type: 'milestone' },
        { id: 3, name: 'Required 2', optional: false, state: 'locked', type: 'milestone' },
        { id: 4, name: 'Optional 2', optional: true, state: 'locked', type: 'milestone' },
        { id: 5, name: 'Required 3', optional: false, state: 'locked', type: 'milestone' },
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          complexMilestones, 
          mockSetMilestones, 
          new Date('2024-01-10'), 
          UNLOCK_STRATEGIES.BY_COMPLETION_ONLY, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.updateMilestoneStates(new Date('2024-01-10'));
      });

      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(complexMilestones);
      
      // Required 2 should unlock (skipping optional milestones)
      expect(updatedMilestones[2].state).toBe('unlocked');
      // Required 3 should remain locked (Required 2 not completed)
      expect(updatedMilestones[4].state).toBe('locked');
      // Optional milestones should unlock based on same logic
      expect(updatedMilestones[1].state).toBe('unlocked'); // Optional 1 can unlock
      expect(updatedMilestones[3].state).toBe('locked'); // Optional 2 blocked by Required 2
    });

    it('should handle completing milestone in middle of chain', () => {
      const chainMilestones = [
        { id: 1, name: 'M1', optional: false, state: 'completed', type: 'milestone' },
        { id: 2, name: 'M2', optional: false, state: 'unlocked', type: 'milestone' },
        { id: 3, name: 'M3', optional: false, state: 'locked', type: 'milestone' },
        { id: 4, name: 'M4', optional: false, state: 'locked', type: 'milestone' },
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          chainMilestones, 
          mockSetMilestones, 
          new Date('2024-01-10'), 
          UNLOCK_STRATEGIES.BY_COMPLETION_ONLY, 
          mockOnStateChange
        )
      );

      // Complete M2 manually
      act(() => {
        result.current.changeState(2, 'completed');
      });

      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(chainMilestones);
      
      // M2 should be completed
      expect(updatedMilestones[1].state).toBe('completed');
      // M3 should unlock due to cascade
      expect(updatedMilestones[2].state).toBe('unlocked');
      // M4 should remain locked
      expect(updatedMilestones[3].state).toBe('locked');
    });
  });

  describe('Strategy switching edge cases', () => {
    it('should handle strategy change without losing milestone states', () => {
      const milestones = [
        { id: 1, name: 'M1', optional: false, state: 'completed', type: 'milestone' },
        { id: 2, name: 'M2', optional: false, state: 'unlocked', startDate: new Date('2024-01-20'), type: 'milestone' },
        { id: 3, name: 'M3', optional: false, state: 'locked', startDate: new Date('2024-01-25'), type: 'milestone' },
      ];

      // Start with completion strategy
      const { result, rerender } = renderHook(
        ({ strategy }) => useUnlockStrategies(
          milestones, 
          mockSetMilestones, 
          new Date('2024-01-15'), 
          strategy, 
          mockOnStateChange
        ),
        { initialProps: { strategy: UNLOCK_STRATEGIES.BY_COMPLETION_ONLY } }
      );

      // Switch to date-only strategy
      rerender({ strategy: UNLOCK_STRATEGIES.BY_UNLOCK_AT_ONLY });

      act(() => {
        result.current.updateMilestoneStates(new Date('2024-01-25')); // Date when M3 should unlock
      });

      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(milestones);
      
      // M1 should remain completed
      expect(updatedMilestones[0].state).toBe('completed');
      // M2 should unlock by date (already past its start date)
      expect(updatedMilestones[1].state).toBe('unlocked');
      // M3 should unlock by date
      expect(updatedMilestones[2].state).toBe('unlocked');
    });
  });

  describe('Administrative override scenarios', () => {
    it('should handle manual unlock triggering cascade effects', () => {
      const milestones = [
        { id: 1, name: 'M1', optional: false, state: 'locked', type: 'milestone' },
        { id: 2, name: 'M2', optional: false, state: 'locked', type: 'milestone' },
        { id: 3, name: 'M3', optional: false, state: 'locked', type: 'milestone' },
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          milestones, 
          mockSetMilestones, 
          new Date('2024-01-10'), 
          UNLOCK_STRATEGIES.BY_COMPLETION_ONLY, 
          mockOnStateChange
        )
      );

      // Admin manually unlocks M1
      act(() => {
        result.current.changeState(1, 'unlocked');
      });

      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(milestones);
      
      // M1 should be unlocked
      expect(updatedMilestones[0].state).toBe('unlocked');
      // M2 and M3 should remain locked (M1 not completed)
      expect(updatedMilestones[1].state).toBe('locked');
      expect(updatedMilestones[2].state).toBe('locked');
    });

    it('should handle manual completion triggering cascade unlocks', () => {
      const milestones = [
        { id: 1, name: 'M1', optional: false, state: 'locked', type: 'milestone' },
        { id: 2, name: 'M2', optional: false, state: 'locked', type: 'milestone' },
        { id: 3, name: 'M3', optional: false, state: 'locked', type: 'milestone' },
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          milestones, 
          mockSetMilestones, 
          new Date('2024-01-10'), 
          UNLOCK_STRATEGIES.BY_COMPLETION_ONLY, 
          mockOnStateChange
        )
      );

      // Admin manually completes M1
      act(() => {
        result.current.changeState(1, 'completed');
      });

      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(milestones);
      
      // M1 should be completed
      expect(updatedMilestones[0].state).toBe('completed');
      // M2 should unlock due to cascade
      expect(updatedMilestones[1].state).toBe('unlocked');
      // M3 should remain locked
      expect(updatedMilestones[2].state).toBe('locked');
    });
  });

  describe('Data integrity validation', () => {
    it('should handle milestones with null start dates gracefully', () => {
      const milestonesWithNulls = [
        { id: 1, name: 'M1', optional: false, state: 'completed', startDate: null, type: 'milestone' },
        { id: 2, name: 'M2', optional: false, state: 'locked', startDate: null, type: 'milestone' },
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          milestonesWithNulls, 
          mockSetMilestones, 
          new Date('2024-01-10'), 
          UNLOCK_STRATEGIES.BY_UNLOCK_AT_OR_COMPLETION, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.updateMilestoneStates(new Date('2024-01-10'));
      });

      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(milestonesWithNulls);
      
      // Should fallback to completion logic when start date is null
      expect(updatedMilestones[1].state).toBe('unlocked');
    });

    it('should handle empty milestone arrays', () => {
      const { result } = renderHook(() => 
        useUnlockStrategies(
          [], 
          mockSetMilestones, 
          new Date('2024-01-10'), 
          UNLOCK_STRATEGIES.BY_COMPLETION_ONLY, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.updateMilestoneStates(new Date('2024-01-10'));
      });

      // Should not throw and setMilestones should be called with empty array
      expect(mockSetMilestones).toHaveBeenCalled();
    });

    it('should handle malformed milestone objects', () => {
      const malformedMilestones = [
        { id: 1, name: 'M1', optional: false, state: 'completed', type: 'milestone' }, // Missing startDate
        { id: 2, state: 'locked', optional: false, type: 'milestone' }, // Missing name
        { id: 3, name: 'M3', optional: false, type: 'milestone' }, // Missing state
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          malformedMilestones, 
          mockSetMilestones, 
          new Date('2024-01-10'), 
          UNLOCK_STRATEGIES.BY_COMPLETION_ONLY, 
          mockOnStateChange
        )
      );

      // Should not throw
      expect(() => {
        act(() => {
          result.current.updateMilestoneStates(new Date('2024-01-10'));
        });
      }).not.toThrow();
    });
  });

  describe('Cascade prevention and state consistency', () => {
    it('should not create infinite loops in state updates', () => {
      const milestones = [
        { id: 1, name: 'M1', optional: false, state: 'completed', type: 'milestone' },
        { id: 2, name: 'M2', optional: false, state: 'locked', type: 'milestone' },
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          milestones, 
          mockSetMilestones, 
          new Date('2024-01-10'), 
          UNLOCK_STRATEGIES.BY_COMPLETION_ONLY, 
          mockOnStateChange
        )
      );

      // Trigger multiple rapid updates
      act(() => {
        result.current.updateMilestoneStates(new Date('2024-01-10'));
        result.current.updateMilestoneStates(new Date('2024-01-10'));
        result.current.updateMilestoneStates(new Date('2024-01-10'));
      });

      // Should only call setMilestones a reasonable number of times
      expect(mockSetMilestones.mock.calls.length).toBeLessThan(5);
    });

    it('should maintain referential equality when no changes occur', () => {
      const milestones = [
        { id: 1, name: 'M1', optional: false, state: 'completed', type: 'milestone' },
        { id: 2, name: 'M2', optional: false, state: 'unlocked', type: 'milestone' },
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          milestones, 
          mockSetMilestones, 
          new Date('2024-01-10'), 
          UNLOCK_STRATEGIES.BY_COMPLETION_ONLY, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.updateMilestoneStates(new Date('2024-01-10'));
      });

      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(milestones);
      
      // When no state changes, should return original array
      expect(updatedMilestones).toBe(milestones);
    });
  });
});