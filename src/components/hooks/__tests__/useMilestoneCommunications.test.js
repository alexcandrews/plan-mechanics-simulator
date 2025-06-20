import { renderHook } from '@testing-library/react';
import { useMilestoneCommunications } from '../useMilestoneCommunications';

describe('useMilestoneCommunications', () => {
  const mockScheduleCommunication = jest.fn();
  
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleMilestoneStateChange', () => {
    it('should schedule communication when required milestone is unlocked', () => {
      const { result } = renderHook(() => 
        useMilestoneCommunications(defaultRules, mockScheduleCommunication)
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
        daysOffset: 3
      });
    });

    it('should not schedule communication when rules are disabled', () => {
      const disabledRules = {
        ...defaultRules,
        milestoneUnlocked: {
          ...defaultRules.milestoneUnlocked,
          enabled: false
        }
      };

      const { result } = renderHook(() => 
        useMilestoneCommunications(disabledRules, mockScheduleCommunication)
      );

      const milestone = {
        id: 1,
        name: 'Test Milestone',
        type: 'milestone',
        optional: false
      };

      result.current.handleMilestoneStateChange(milestone, 'locked', 'unlocked');

      expect(mockScheduleCommunication).not.toHaveBeenCalled();
    });

    it('should ignore optional milestones when ignoreOptional is true', () => {
      const { result } = renderHook(() => 
        useMilestoneCommunications(defaultRules, mockScheduleCommunication)
      );

      const optionalMilestone = {
        id: 1,
        name: 'Optional Milestone',
        type: 'milestone',
        optional: true
      };

      result.current.handleMilestoneStateChange(optionalMilestone, 'locked', 'unlocked');

      expect(mockScheduleCommunication).not.toHaveBeenCalled();
    });

    it('should include optional milestones when ignoreOptional is false', () => {
      const includeOptionalRules = {
        ...defaultRules,
        milestoneUnlocked: {
          ...defaultRules.milestoneUnlocked,
          ignoreOptional: false
        }
      };

      const { result } = renderHook(() => 
        useMilestoneCommunications(includeOptionalRules, mockScheduleCommunication)
      );

      const optionalMilestone = {
        id: 1,
        name: 'Optional Milestone',
        type: 'milestone',
        optional: true
      };

      result.current.handleMilestoneStateChange(optionalMilestone, 'locked', 'unlocked');

      expect(mockScheduleCommunication).toHaveBeenCalledWith({
        rule: 'milestoneUnlocked',
        milestoneId: 1,
        milestoneName: 'Optional Milestone',
        daysOffset: 3
      });
    });

    it('should handle chapter milestones when applyToChapters is true', () => {
      const { result } = renderHook(() => 
        useMilestoneCommunications(defaultRules, mockScheduleCommunication)
      );

      const chapterMilestone = {
        id: 1,
        name: 'Chapter 1',
        type: 'milestone', // Assuming 'milestone' represents chapters
        optional: false
      };

      result.current.handleMilestoneStateChange(chapterMilestone, 'locked', 'unlocked');

      expect(mockScheduleCommunication).toHaveBeenCalled();
    });

    it('should ignore session milestones when applyToSessions is false', () => {
      const { result } = renderHook(() => 
        useMilestoneCommunications(defaultRules, mockScheduleCommunication)
      );

      const sessionMilestone = {
        id: 1,
        name: 'Session 1',
        type: 'session',
        optional: false
      };

      result.current.handleMilestoneStateChange(sessionMilestone, 'locked', 'unlocked');

      expect(mockScheduleCommunication).not.toHaveBeenCalled();
    });

    it('should handle session milestones when applyToSessions is true', () => {
      const sessionRules = {
        ...defaultRules,
        milestoneUnlocked: {
          ...defaultRules.milestoneUnlocked,
          applyToSessions: true
        }
      };

      const { result } = renderHook(() => 
        useMilestoneCommunications(sessionRules, mockScheduleCommunication)
      );

      const sessionMilestone = {
        id: 1,
        name: 'Session 1',
        type: 'session',
        optional: false
      };

      result.current.handleMilestoneStateChange(sessionMilestone, 'locked', 'unlocked');

      expect(mockScheduleCommunication).toHaveBeenCalledWith({
        rule: 'milestoneUnlocked',
        milestoneId: 1,
        milestoneName: 'Session 1',
        daysOffset: 3
      });
    });

    it('should not schedule communication for non-unlock state changes', () => {
      const { result } = renderHook(() => 
        useMilestoneCommunications(defaultRules, mockScheduleCommunication)
      );

      const milestone = {
        id: 1,
        name: 'Test Milestone',
        type: 'milestone',
        optional: false
      };

      // Test completion change - should not trigger
      result.current.handleMilestoneStateChange(milestone, 'unlocked', 'completed');
      expect(mockScheduleCommunication).not.toHaveBeenCalled();

      // Clear mocks to test the next case
      jest.clearAllMocks();

      // Test going from completed to unlocked - this IS an unlock but oldState was not 'locked'
      // According to the logic, it should trigger because newState is 'unlocked'
      // but oldState is not 'unlocked', so it should trigger
      result.current.handleMilestoneStateChange(milestone, 'completed', 'unlocked');
      expect(mockScheduleCommunication).toHaveBeenCalledWith({
        rule: 'milestoneUnlocked',
        milestoneId: 1,
        milestoneName: 'Test Milestone',
        daysOffset: 3
      });
    });

    it('should use custom days offset from rules', () => {
      const customDaysRules = {
        ...defaultRules,
        milestoneUnlocked: {
          ...defaultRules.milestoneUnlocked,
          days: 7 // Custom days
        }
      };

      const { result } = renderHook(() => 
        useMilestoneCommunications(customDaysRules, mockScheduleCommunication)
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
        daysOffset: 7
      });
    });
  });
});