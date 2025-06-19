import { useCallback } from 'react';

export const useMilestoneCommunications = (rules, scheduleCommunication) => {
  const handleMilestoneStateChange = useCallback((milestone, oldState, newState) => {
    // Only trigger on the transition from locked to unlocked.
    if (newState !== 'unlocked' || oldState === 'unlocked') {
      return;
    }

    const { milestoneUnlocked } = rules;

    // Rule 1: Is the 'Milestone Unlocked' rule enabled?
    if (!milestoneUnlocked.enabled) {
      return;
    }

    // Rule 2: Does the rule apply to this milestone type?
    const milestoneType = milestone.type === 'session' ? 'applyToSessions' : 'applyToChapters';
    if (!milestoneUnlocked[milestoneType]) {
      return;
    }

    // Rule 3: Should we ignore optional milestones?
    if (milestoneUnlocked.ignoreOptional && milestone.optional) {
      return;
    }

    // If all checks pass, schedule the communication.
    scheduleCommunication({
      rule: 'milestoneUnlocked',
      milestoneId: milestone.id,
      daysOffset: milestoneUnlocked.days,
    });

  }, [rules, scheduleCommunication]);

  return {
    handleMilestoneStateChange
  };
}; 