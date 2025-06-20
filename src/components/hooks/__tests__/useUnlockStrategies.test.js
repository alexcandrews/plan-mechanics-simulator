import { renderHook, act } from '@testing-library/react';
import { useUnlockStrategies } from '../useUnlockStrategies';
import { UNLOCK_STRATEGIES } from '../../utils';

describe('useUnlockStrategies', () => {
  // Test data setup
  const createMilestone = (id, name, optional = false, state = 'locked', startDate = null) => ({
    id,
    name,
    optional,
    state,
    startDate: startDate ? new Date(startDate) : null,
    type: 'milestone'
  });

  const mockOnStateChange = jest.fn();
  let mockMilestones;
  let mockSetMilestones;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMilestones = [
      createMilestone(1, 'Milestone 1', false, 'completed'),
      createMilestone(2, 'Milestone 2', false, 'locked', '2024-01-15'),
      createMilestone(3, 'Milestone 3', true, 'locked', '2024-01-20'), // optional
      createMilestone(4, 'Milestone 4', false, 'locked', '2024-01-25'),
    ];
    mockSetMilestones = jest.fn();
  });

  describe('BY_COMPLETION_ONLY strategy', () => {
    it('should unlock milestone when prerequisites are completed', () => {
      const currentDate = new Date('2024-01-10');
      const { result } = renderHook(() => 
        useUnlockStrategies(
          mockMilestones, 
          mockSetMilestones, 
          currentDate, 
          UNLOCK_STRATEGIES.BY_COMPLETION_ONLY, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.updateMilestoneStates(currentDate);
      });

      expect(mockSetMilestones).toHaveBeenCalled();
      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(mockMilestones);
      
      // Milestone 2 should be unlocked because Milestone 1 is completed
      expect(updatedMilestones[1].state).toBe('unlocked');
      // Milestone 4 should remain locked because optional Milestone 3 doesn't block it, but Milestone 2 is not completed
      expect(updatedMilestones[3].state).toBe('locked');
    });

    it('should ignore start dates in BY_COMPLETION_ONLY strategy', () => {
      const futureDate = new Date('2024-02-01'); // After all start dates
      const { result } = renderHook(() => 
        useUnlockStrategies(
          mockMilestones, 
          mockSetMilestones, 
          futureDate, 
          UNLOCK_STRATEGIES.BY_COMPLETION_ONLY, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.updateMilestoneStates(futureDate);
      });

      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(mockMilestones);
      
      // Even though the date has passed, only completion matters
      expect(updatedMilestones[1].state).toBe('unlocked'); // Prerequisites met
      expect(updatedMilestones[3].state).toBe('locked'); // Prerequisites not met
    });

    it('should ignore optional milestones when checking prerequisites', () => {
      const milestonesWithOptional = [
        createMilestone(1, 'Milestone 1', false, 'completed'),
        createMilestone(2, 'Milestone 2', true, 'locked'), // optional, not completed
        createMilestone(3, 'Milestone 3', false, 'locked'), // should unlock despite optional #2
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          milestonesWithOptional, 
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
      const updatedMilestones = setMilestonesCall(milestonesWithOptional);
      
      // Milestone 3 should unlock because it only depends on required Milestone 1
      expect(updatedMilestones[2].state).toBe('unlocked');
    });
  });

  describe('BY_UNLOCK_AT_ONLY strategy', () => {
    it('should unlock milestone when start date is reached', () => {
      const currentDate = new Date('2024-01-15'); // Matches Milestone 2's start date
      const { result } = renderHook(() => 
        useUnlockStrategies(
          mockMilestones, 
          mockSetMilestones, 
          currentDate, 
          UNLOCK_STRATEGIES.BY_UNLOCK_AT_ONLY, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.updateMilestoneStates(currentDate);
      });

      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(mockMilestones);
      
      // Milestone 2 should be unlocked because its start date is reached
      expect(updatedMilestones[1].state).toBe('unlocked');
      // Other milestones should remain locked
      expect(updatedMilestones[2].state).toBe('locked');
      expect(updatedMilestones[3].state).toBe('locked');
    });

    it('should ignore completion status in BY_UNLOCK_AT_ONLY strategy', () => {
      const milestonesIgnoreCompletion = [
        createMilestone(1, 'Milestone 1', false, 'locked'), // Not completed
        createMilestone(2, 'Milestone 2', false, 'locked', '2024-01-15'), // Should unlock by date
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          milestonesIgnoreCompletion, 
          mockSetMilestones, 
          new Date('2024-01-15'), 
          UNLOCK_STRATEGIES.BY_UNLOCK_AT_ONLY, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.updateMilestoneStates(new Date('2024-01-15'));
      });

      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(milestonesIgnoreCompletion);
      
      // Milestone 2 should unlock despite prerequisite not being completed
      expect(updatedMilestones[1].state).toBe('unlocked');
    });

    it('should not unlock milestone without start date', () => {
      const milestonesNoDate = [
        createMilestone(1, 'Milestone 1', false, 'locked'), // No start date
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          milestonesNoDate, 
          mockSetMilestones, 
          new Date('2024-01-15'), 
          UNLOCK_STRATEGIES.BY_UNLOCK_AT_ONLY, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.updateMilestoneStates(new Date('2024-01-15'));
      });

      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(milestonesNoDate);
      
      // Milestone should remain locked without a start date
      expect(updatedMilestones[0].state).toBe('locked');
    });
  });

  describe('BY_UNLOCK_AT_OR_COMPLETION strategy', () => {
    it('should unlock when either prerequisites are completed OR start date is reached', () => {
      const { result } = renderHook(() => 
        useUnlockStrategies(
          mockMilestones, 
          mockSetMilestones, 
          new Date('2024-01-10'), // Before start dates
          UNLOCK_STRATEGIES.BY_UNLOCK_AT_OR_COMPLETION, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.updateMilestoneStates(new Date('2024-01-10'));
      });

      let setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      let updatedMilestones = setMilestonesCall(mockMilestones);
      
      // Milestone 2 should unlock because prerequisites are met
      expect(updatedMilestones[1].state).toBe('unlocked');

      // Reset and test date-based unlock
      jest.clearAllMocks();
      const milestonesDateUnlock = [
        createMilestone(1, 'Milestone 1', false, 'locked'), // Not completed
        createMilestone(2, 'Milestone 2', false, 'locked', '2024-01-15'), // Should unlock by date
      ];

      const { result: result2 } = renderHook(() => 
        useUnlockStrategies(
          milestonesDateUnlock, 
          mockSetMilestones, 
          new Date('2024-01-15'), 
          UNLOCK_STRATEGIES.BY_UNLOCK_AT_OR_COMPLETION, 
          mockOnStateChange
        )
      );

      act(() => {
        result2.current.updateMilestoneStates(new Date('2024-01-15'));
      });

      setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      updatedMilestones = setMilestonesCall(milestonesDateUnlock);
      
      // Milestone 2 should unlock because start date is reached
      expect(updatedMilestones[1].state).toBe('unlocked');
    });
  });

  describe('BY_UNLOCK_AT_AND_COMPLETION strategy', () => {
    it('should unlock only when both prerequisites are completed AND start date is reached', () => {
      // First test: Prerequisites met but date not reached
      const { result } = renderHook(() => 
        useUnlockStrategies(
          mockMilestones, 
          mockSetMilestones, 
          new Date('2024-01-10'), // Before Milestone 2's start date
          UNLOCK_STRATEGIES.BY_UNLOCK_AT_AND_COMPLETION, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.updateMilestoneStates(new Date('2024-01-10'));
      });

      let setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      let updatedMilestones = setMilestonesCall(mockMilestones);
      
      // Milestone 2 should remain locked because date hasn't been reached
      expect(updatedMilestones[1].state).toBe('locked');

      // Second test: Date reached and prerequisites met
      jest.clearAllMocks();
      const { result: result2 } = renderHook(() => 
        useUnlockStrategies(
          mockMilestones, 
          mockSetMilestones, 
          new Date('2024-01-15'), // On Milestone 2's start date
          UNLOCK_STRATEGIES.BY_UNLOCK_AT_AND_COMPLETION, 
          mockOnStateChange
        )
      );

      act(() => {
        result2.current.updateMilestoneStates(new Date('2024-01-15'));
      });

      setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      updatedMilestones = setMilestonesCall(mockMilestones);
      
      // Now Milestone 2 should unlock because both conditions are met
      expect(updatedMilestones[1].state).toBe('unlocked');
    });

    it('should not unlock when only one condition is met', () => {
      const milestonesOneCondition = [
        createMilestone(1, 'Milestone 1', false, 'locked'), // Not completed
        createMilestone(2, 'Milestone 2', false, 'locked', '2024-01-15'), // Date reached but prereq not met
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          milestonesOneCondition, 
          mockSetMilestones, 
          new Date('2024-01-15'), 
          UNLOCK_STRATEGIES.BY_UNLOCK_AT_AND_COMPLETION, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.updateMilestoneStates(new Date('2024-01-15'));
      });

      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(milestonesOneCondition);
      
      // Milestone 2 should remain locked because prerequisites aren't met
      expect(updatedMilestones[1].state).toBe('locked');
    });
  });

  describe('Manual state changes', () => {
    it('should manually change milestone state and trigger cascade updates', () => {
      const cascadeMilestones = [
        createMilestone(1, 'Milestone 1', false, 'unlocked'),
        createMilestone(2, 'Milestone 2', false, 'locked'),
        createMilestone(3, 'Milestone 3', false, 'locked'),
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          cascadeMilestones, 
          mockSetMilestones, 
          new Date('2024-01-10'), 
          UNLOCK_STRATEGIES.BY_COMPLETION_ONLY, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.changeState(1, 'completed');
      });

      expect(mockSetMilestones).toHaveBeenCalled();
      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(cascadeMilestones);
      
      // Milestone 1 should be completed
      expect(updatedMilestones[0].state).toBe('completed');
      // Milestone 2 should unlock due to cascade
      expect(updatedMilestones[1].state).toBe('unlocked');
      // Milestone 3 should remain locked
      expect(updatedMilestones[2].state).toBe('locked');
      
      // Verify onStateChange was called
      expect(mockOnStateChange).toHaveBeenCalled();
    });
  });

  describe('Completed milestones protection', () => {
    it('should never change completed milestones during strategy updates', () => {
      const protectedMilestones = [
        createMilestone(1, 'Milestone 1', false, 'completed'),
        createMilestone(2, 'Milestone 2', false, 'completed'), // Should stay completed
        createMilestone(3, 'Milestone 3', false, 'locked'),
      ];

      const { result } = renderHook(() => 
        useUnlockStrategies(
          protectedMilestones, 
          mockSetMilestones, 
          new Date('2024-01-01'), // Early date that wouldn't normally unlock anything
          UNLOCK_STRATEGIES.BY_UNLOCK_AT_ONLY, 
          mockOnStateChange
        )
      );

      act(() => {
        result.current.updateMilestoneStates(new Date('2024-01-01'));
      });

      const setMilestonesCall = mockSetMilestones.mock.calls[0][0];
      const updatedMilestones = setMilestonesCall(protectedMilestones);
      
      // Completed milestones should remain completed
      expect(updatedMilestones[0].state).toBe('completed');
      expect(updatedMilestones[1].state).toBe('completed');
      // Other milestone should remain locked due to strategy
      expect(updatedMilestones[2].state).toBe('locked');
    });
  });
});