import { renderHook } from '@testing-library/react';
import { useRedirectionLogic } from '../useRedirectionLogic';

describe('useRedirectionLogic', () => {
  // Helper function to create test milestones
  const createMilestone = (id, name, state = 'locked', optional = false, position = id) => ({
    id,
    name,
    state,
    optional,
    position,
    type: 'milestone'
  });

  describe('Priority 1: First Unlocked Required Milestone', () => {
    it('should redirect to first unlocked required milestone', () => {
      const milestones = [
        createMilestone(1, 'Milestone 1', 'completed', false, 1),
        createMilestone(2, 'Milestone 2', 'unlocked', false, 2), // Should target this
        createMilestone(3, 'Milestone 3', 'unlocked', false, 3),
        createMilestone(4, 'Milestone 4', 'locked', false, 4)
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      expect(result.current.currentMilestone).toEqual({
        id: 2,
        name: 'Milestone 2',
        reason: 'First Unlocked Required Milestone'
      });
    });

    it('should skip optional milestones when finding first unlocked required', () => {
      const milestones = [
        createMilestone(1, 'Milestone 1', 'completed', false, 1),
        createMilestone(2, 'Optional Milestone', 'unlocked', true, 2), // Optional - skip
        createMilestone(3, 'Milestone 3', 'unlocked', false, 3), // Should target this
        createMilestone(4, 'Milestone 4', 'locked', false, 4)
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      expect(result.current.currentMilestone).toEqual({
        id: 3,
        name: 'Milestone 3',
        reason: 'First Unlocked Required Milestone'
      });
    });

    it('should skip completed milestones when finding unlocked required', () => {
      const milestones = [
        createMilestone(1, 'Milestone 1', 'completed', false, 1),
        createMilestone(2, 'Milestone 2', 'completed', false, 2), // Completed - skip
        createMilestone(3, 'Milestone 3', 'unlocked', false, 3), // Should target this
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      expect(result.current.currentMilestone).toEqual({
        id: 3,
        name: 'Milestone 3',
        reason: 'First Unlocked Required Milestone'
      });
    });
  });

  describe('Priority 2: First Unlocked Optional Milestone', () => {
    it('should redirect to first unlocked optional milestone when no required milestones are unlocked', () => {
      const milestones = [
        createMilestone(1, 'Milestone 1', 'completed', false, 1),
        createMilestone(2, 'Milestone 2', 'completed', false, 2),
        createMilestone(3, 'Optional Milestone', 'unlocked', true, 3), // Should target this
        createMilestone(4, 'Another Optional', 'unlocked', true, 4),
        createMilestone(5, 'Milestone 5', 'locked', false, 5)
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      expect(result.current.currentMilestone).toEqual({
        id: 3,
        name: 'Optional Milestone',
        reason: 'First Unlocked Optional Milestone'
      });
    });

    it('should prefer required milestones over optional ones', () => {
      const milestones = [
        createMilestone(1, 'Milestone 1', 'completed', false, 1),
        createMilestone(2, 'Optional Early', 'unlocked', true, 2), // Optional but earlier
        createMilestone(3, 'Required Later', 'unlocked', false, 3), // Required - should prefer this
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      expect(result.current.currentMilestone).toEqual({
        id: 3,
        name: 'Required Later',
        reason: 'First Unlocked Required Milestone'
      });
    });

    it('should choose earliest optional milestone by position', () => {
      const milestones = [
        createMilestone(1, 'Milestone 1', 'completed', false, 1),
        createMilestone(2, 'Milestone 2', 'completed', false, 2),
        createMilestone(3, 'Optional Later', 'unlocked', true, 5), // Higher position
        createMilestone(4, 'Optional Earlier', 'unlocked', true, 3), // Should target this
        createMilestone(5, 'Milestone 5', 'locked', false, 6)
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      expect(result.current.currentMilestone).toEqual({
        id: 4,
        name: 'Optional Earlier',
        reason: 'First Unlocked Optional Milestone'
      });
    });
  });

  describe('Priority 3: Last Completed Milestone', () => {
    it('should redirect to last completed milestone when nothing is unlocked', () => {
      const milestones = [
        createMilestone(1, 'Milestone 1', 'completed', false, 1),
        createMilestone(2, 'Milestone 2', 'completed', false, 2), // Should target this (last completed)
        createMilestone(3, 'Milestone 3', 'locked', false, 3),
        createMilestone(4, 'Milestone 4', 'locked', false, 4)
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      expect(result.current.currentMilestone).toEqual({
        id: 2,
        name: 'Milestone 2',
        reason: 'Last Completed Milestone'
      });
    });

    it('should find last completed milestone including optional ones', () => {
      const milestones = [
        createMilestone(1, 'Milestone 1', 'completed', false, 1),
        createMilestone(2, 'Required Completed', 'completed', false, 2),
        createMilestone(3, 'Optional Completed', 'completed', true, 3), // Should target this (last completed)
        createMilestone(4, 'Milestone 4', 'locked', false, 4)
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      expect(result.current.currentMilestone).toEqual({
        id: 3,
        name: 'Optional Completed',
        reason: 'Last Completed Milestone'
      });
    });

    it('should handle out-of-order positions when finding last completed', () => {
      const milestones = [
        createMilestone(1, 'Milestone 1', 'completed', false, 1),
        createMilestone(2, 'Milestone 2', 'completed', false, 5), // Highest position, should target this
        createMilestone(3, 'Milestone 3', 'completed', false, 3),
        createMilestone(4, 'Milestone 4', 'locked', false, 6)
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      expect(result.current.currentMilestone).toEqual({
        id: 2,
        name: 'Milestone 2',
        reason: 'Last Completed Milestone'
      });
    });
  });

  describe('Priority 4: First Milestone in Plan (Fallback)', () => {
    it('should redirect to first milestone when no milestones are completed or unlocked', () => {
      const milestones = [
        createMilestone(1, 'Milestone 1', 'locked', false, 1), // Should target this (first in plan)
        createMilestone(2, 'Milestone 2', 'locked', false, 2),
        createMilestone(3, 'Milestone 3', 'locked', false, 3)
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      expect(result.current.currentMilestone).toEqual({
        id: 1,
        name: 'Milestone 1',
        reason: 'First Milestone in Plan (Fallback)'
      });
    });

    it('should find first milestone by position, not by ID', () => {
      const milestones = [
        createMilestone(3, 'Milestone 3', 'locked', false, 1), // Position 1 - should target this
        createMilestone(1, 'Milestone 1', 'locked', false, 2), // Position 2
        createMilestone(2, 'Milestone 2', 'locked', false, 3)  // Position 3
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      expect(result.current.currentMilestone).toEqual({
        id: 3,
        name: 'Milestone 3',
        reason: 'First Milestone in Plan (Fallback)'
      });
    });

    it('should use first milestone when no positions are defined', () => {
      const milestones = [
        createMilestone(1, 'Milestone 1', 'locked', false, undefined),
        createMilestone(2, 'Milestone 2', 'locked', false, undefined)
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      expect(result.current.currentMilestone).toEqual({
        id: 1,
        name: 'Milestone 1',
        reason: 'First Milestone in Plan (Fallback)'
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty milestones array', () => {
      const { result } = renderHook(() => useRedirectionLogic([]));
      
      expect(result.current.currentMilestone).toBeNull();
    });

    it('should handle undefined milestones', () => {
      const { result } = renderHook(() => useRedirectionLogic(undefined));
      
      expect(result.current.currentMilestone).toBeNull();
    });

    it('should handle milestones with missing properties', () => {
      const milestones = [
        { id: 1, name: 'Incomplete Milestone' }, // Missing state, optional, position
        createMilestone(2, 'Complete Milestone', 'unlocked', false, 2)
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      // Should gracefully handle and still find the complete milestone
      expect(result.current.currentMilestone).toEqual({
        id: 2,
        name: 'Complete Milestone',
        reason: 'First Unlocked Required Milestone'
      });
    });

    it('should handle milestones with duplicate positions', () => {
      const milestones = [
        createMilestone(1, 'Milestone 1', 'completed', false, 1),
        createMilestone(2, 'Milestone 2', 'unlocked', false, 2), // Should target this (first with position 2)
        createMilestone(3, 'Milestone 3', 'unlocked', false, 2)  // Same position
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      expect(result.current.currentMilestone).toEqual({
        id: 2,
        name: 'Milestone 2',
        reason: 'First Unlocked Required Milestone'
      });
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle mixed milestone types and states correctly', () => {
      const milestones = [
        createMilestone(1, 'Chapter 1', 'completed', false, 1),
        createMilestone(2, 'Optional Reading', 'unlocked', true, 2),
        createMilestone(3, 'Session 1', 'completed', false, 3),
        createMilestone(4, 'Chapter 2', 'unlocked', false, 4), // Should target this
        createMilestone(5, 'Optional Exercise', 'unlocked', true, 5),
        createMilestone(6, 'Session 2', 'locked', false, 6)
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      expect(result.current.currentMilestone).toEqual({
        id: 4,
        name: 'Chapter 2',
        reason: 'First Unlocked Required Milestone'
      });
    });

    it('should prioritize earlier required over later optional when both are unlocked', () => {
      const milestones = [
        createMilestone(1, 'Milestone 1', 'completed', false, 1),
        createMilestone(2, 'Optional Early', 'unlocked', true, 2),
        createMilestone(3, 'Required Later', 'unlocked', false, 5), // Should target this despite higher position
        createMilestone(4, 'Optional Later', 'unlocked', true, 6)
      ];

      const { result } = renderHook(() => useRedirectionLogic(milestones));
      
      expect(result.current.currentMilestone).toEqual({
        id: 3,
        name: 'Required Later',
        reason: 'First Unlocked Required Milestone'
      });
    });

    it('should update when milestones change', () => {
      const initialMilestones = [
        createMilestone(1, 'Milestone 1', 'locked', false, 1)
      ];

      const { result, rerender } = renderHook(
        ({ milestones }) => useRedirectionLogic(milestones),
        { initialProps: { milestones: initialMilestones } }
      );

      // Initially should target first milestone as fallback
      expect(result.current.currentMilestone).toEqual({
        id: 1,
        name: 'Milestone 1',
        reason: 'First Milestone in Plan (Fallback)'
      });

      // Update milestone to unlocked
      const updatedMilestones = [
        createMilestone(1, 'Milestone 1', 'unlocked', false, 1)
      ];

      rerender({ milestones: updatedMilestones });

      // Should now target as unlocked required milestone
      expect(result.current.currentMilestone).toEqual({
        id: 1,
        name: 'Milestone 1',
        reason: 'First Unlocked Required Milestone'
      });
    });
  });
});