import { useCallback, useRef } from 'react';

export const useMilestoneCommunications = (rules, scheduleCommunication) => {
  // Track unlocked milestones within a short time window for furthestOnly logic
  const recentUnlocksRef = useRef([]);

  const handleMilestoneStateChange = useCallback((milestone, oldState, newState) => {
    // Only trigger on transitions TO 'unlocked' (from any other state)
    if (newState !== 'unlocked' || oldState === 'unlocked') {
      return;
    }

    // Validate that required rules configuration exists
    if (!rules || !rules.milestoneUnlocked) {
      throw new Error('Missing required milestoneUnlocked configuration in rules');
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

    // If all checks pass, handle furthestOnly logic
    if (milestoneUnlocked.furthestOnly) {
      // Track this unlock for batch processing
      const unlockEntry = { milestone, processed: false };
      recentUnlocksRef.current.push(unlockEntry);

      // Use a longer timeout to ensure all simultaneous unlocks are captured
      setTimeout(() => {
        // Only process if this entry hasn't been processed yet
        if (!unlockEntry.processed) {
          // Find all unprocessed unlocks
          const unprocessedUnlocks = recentUnlocksRef.current.filter(unlock => !unlock.processed);
          
          if (unprocessedUnlocks.length > 0) {
            // Find the furthest milestone (highest position)
            const furthestUnlock = unprocessedUnlocks.reduce((furthest, current) => {
              const currentPosition = current.milestone.position || 0;
              const furthestPosition = furthest.milestone.position || 0;
              return currentPosition > furthestPosition ? current : furthest;
            });

            // Schedule communication only for the furthest milestone
            scheduleCommunication({
              rule: 'milestoneUnlocked',
              milestoneId: furthestUnlock.milestone.id,
              milestoneName: furthestUnlock.milestone.name,
              daysOffset: milestoneUnlocked.days,
            });

            // Mark all as processed
            unprocessedUnlocks.forEach(unlock => {
              unlock.processed = true;
            });
          }

          // Clean up old entries after a delay
          setTimeout(() => {
            recentUnlocksRef.current = recentUnlocksRef.current.filter(
              unlock => !unlock.processed
            );
          }, 100);
        }
      }, 20); // Delay to batch simultaneous unlocks
    } else {
      // Normal behavior - schedule immediately
      scheduleCommunication({
        rule: 'milestoneUnlocked',
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        daysOffset: milestoneUnlocked.days,
      });
    }

  }, [rules, scheduleCommunication]);

  return {
    handleMilestoneStateChange
  };
}; 