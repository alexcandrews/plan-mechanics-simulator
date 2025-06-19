// src/components/hooks/useUnlockStrategies.js
import { useCallback } from 'react';
import { UNLOCK_STRATEGIES } from '../utils';

export const useUnlockStrategies = (milestones, setMilestones, currentDate, unlockStrategy, onStateChange) => {
  const stripTimeFromDate = useCallback((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()), []);

  const arePriorRequiredMilestonesCompleted = useCallback((index, list) => {
    return list.slice(0, index).filter(m => !m.optional).every(m => m.state === 'completed');
  }, []);

  const handleUnlockStrategy = useCallback((milestone, index, list, date) => {
    // A completed milestone should never be changed by the unlocking logic.
    if (milestone.state === 'completed') {
      return milestone;
    }

    const oldState = milestone.state;
    const unlockAt = milestone.startDate ? stripTimeFromDate(milestone.startDate) : null;
    const now = stripTimeFromDate(date);
    const completed = arePriorRequiredMilestonesCompleted(index, list);
    let newState = oldState;

    switch (unlockStrategy) {
      case UNLOCK_STRATEGIES.BY_COMPLETION_ONLY:
        newState = completed ? 'unlocked' : 'locked';
        break;
      case UNLOCK_STRATEGIES.BY_UNLOCK_AT_ONLY:
        newState = unlockAt && now >= unlockAt ? 'unlocked' : 'locked';
        break;
      case UNLOCK_STRATEGIES.BY_UNLOCK_AT_OR_COMPLETION:
        newState = (completed || (unlockAt && now >= unlockAt)) ? 'unlocked' : 'locked';
        break;
      case UNLOCK_STRATEGIES.BY_UNLOCK_AT_AND_COMPLETION:
        newState = (completed && unlockAt && now >= unlockAt) ? 'unlocked' : 'locked';
        break;
      default:
        newState = oldState;
    }

    if (oldState !== newState) onStateChange(milestone, oldState, newState);
    return { ...milestone, state: newState };
  }, [unlockStrategy, stripTimeFromDate, arePriorRequiredMilestonesCompleted, onStateChange]);

  const updateMilestoneStates = useCallback((date) => {
    setMilestones(prev => prev.map((m, i, list) => handleUnlockStrategy(m, i, list, date)));
  }, [handleUnlockStrategy, setMilestones]);

  const changeState = useCallback((id, newState) => {
    const now = stripTimeFromDate(currentDate);
    setMilestones(prevMilestones => {
      // First, create an intermediate array with the state of the target milestone updated.
      const intermediateMilestones = prevMilestones.map(m => {
        if (m.id === id) {
          const oldState = m.state;
          if (oldState !== newState) {
            onStateChange(m, oldState, newState);
          }
          return { ...m, state: newState };
        }
        return m;
      });

      // Now, using the intermediate state, re-evaluate all milestones.
      // This second pass ensures the logic sees the newly updated state of the milestone that was just changed.
      return intermediateMilestones.map((m, i, list) => {
        // The milestone that was just manually changed should not be re-evaluated now.
        if (m.id === id) {
          return m;
        }
        // All other milestones are re-evaluated against the new state of the world.
        return handleUnlockStrategy(m, i, list, now);
      });
    });
  }, [currentDate, handleUnlockStrategy, onStateChange, stripTimeFromDate, setMilestones]);

  return { updateMilestoneStates, changeState };
};