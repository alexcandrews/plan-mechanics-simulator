import { useMemo } from 'react';

export const useRedirectionLogic = (milestones) => {
  const currentMilestone = useMemo(() => {
    // Handle edge cases
    if (!milestones || !Array.isArray(milestones) || milestones.length === 0) {
      return null;
    }

    // Helper function to safely get milestone properties
    const getMilestoneState = (milestone) => milestone?.state || 'locked';
    const getMilestoneOptional = (milestone) => Boolean(milestone?.optional);
    const getMilestonePosition = (milestone) => milestone?.position ?? milestone?.id ?? 0;

    // Sort milestones by position for consistent ordering
    const sortedMilestones = [...milestones].sort((a, b) => {
      const posA = getMilestonePosition(a);
      const posB = getMilestonePosition(b);
      return posA - posB;
    });

    // Priority 1: First Unlocked Required Milestone
    const firstUnlockedRequired = sortedMilestones.find(milestone => {
      const state = getMilestoneState(milestone);
      const isOptional = getMilestoneOptional(milestone);
      return !isOptional && state === 'unlocked';
    });

    if (firstUnlockedRequired) {
      return {
        id: firstUnlockedRequired.id,
        name: firstUnlockedRequired.name,
        reason: 'First Unlocked Required Milestone'
      };
    }

    // Priority 2: First Unlocked Optional Milestone
    const firstUnlockedOptional = sortedMilestones.find(milestone => {
      const state = getMilestoneState(milestone);
      const isOptional = getMilestoneOptional(milestone);
      return isOptional && state === 'unlocked';
    });

    if (firstUnlockedOptional) {
      return {
        id: firstUnlockedOptional.id,
        name: firstUnlockedOptional.name,
        reason: 'First Unlocked Optional Milestone'
      };
    }

    // Priority 3: Last Completed Milestone
    const completedMilestones = sortedMilestones.filter(milestone => {
      const state = getMilestoneState(milestone);
      return state === 'completed';
    });

    if (completedMilestones.length > 0) {
      // Get the last completed milestone (highest position)
      const lastCompleted = completedMilestones[completedMilestones.length - 1];
      return {
        id: lastCompleted.id,
        name: lastCompleted.name,
        reason: 'Last Completed Milestone'
      };
    }

    // Priority 4: First Milestone in Plan (Fallback)
    const firstMilestone = sortedMilestones[0];
    if (firstMilestone) {
      return {
        id: firstMilestone.id,
        name: firstMilestone.name,
        reason: 'First Milestone in Plan (Fallback)'
      };
    }

    return null;
  }, [milestones]);

  return {
    currentMilestone
  };
};