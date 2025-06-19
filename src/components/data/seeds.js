import { UNLOCK_STRATEGIES } from '../utils';

export const initialMilestones = [
  { id: 1, name: 'Milestone 1', type: 'milestone', state: 'unlocked', optional: false },
  { id: 2, name: 'Milestone 2', type: 'milestone', state: 'locked', optional: true },
  { id: 3, name: 'Milestone 3', type: 'milestone', state: 'locked', optional: false },
  { id: 4, name: 'Milestone 4', type: 'milestone', state: 'locked', optional: false },
  { id: 5, name: 'Milestone 5', type: 'milestone', state: 'locked', optional: false }
];

export const initialUnlockStrategy = UNLOCK_STRATEGIES.BY_COMPLETION_ONLY;

export const initialCommunication = null;