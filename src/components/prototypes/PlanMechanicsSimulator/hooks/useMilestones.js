import { useState } from 'react';
import { initialMilestones } from '../data/seeds';

export const useMilestones = (addCommunication) => {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneType, setNewMilestoneType] = useState('milestone');
  const [newMilestoneOptional, setNewMilestoneOptional] = useState(false);
  const [newMilestoneStartDate, setNewMilestoneStartDate] = useState(new Date());
  const [newMilestoneEndDate, setNewMilestoneEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });

  const updateMilestoneStates = (updatedMilestones) => {
    const result = [...updatedMilestones];
    const newUnlocks = [];
    
    if (result.length > 0 && result[0].state === 'locked') {
      result[0].state = 'unlocked';
      newUnlocks.push({...result[0]});
    }
    
    for (let i = 1; i < result.length; i++) {
      let lastRequiredIndex = -1;
      for (let j = i - 1; j >= 0; j--) {
        if (!result[j].optional) {
          lastRequiredIndex = j;
          break;
        }
      }
      
      if (lastRequiredIndex === -1 || result[lastRequiredIndex].state === 'completed') {
        if (result[i].state === 'locked') {
          result[i].state = 'unlocked';
          newUnlocks.push({...result[i]});
        }
      } else if (result[lastRequiredIndex].state !== 'completed' && result[i].state === 'unlocked') {
        result[i].state = 'locked';
      }
    }
    
    return { updatedMilestones: result, newUnlocks };
  };

  const addMilestone = () => {
    if (!newMilestoneName.trim()) return;
    
    const newMilestone = {
      id: Date.now(),
      name: newMilestoneName,
      type: newMilestoneType,
      state: milestones.length === 0 ? 'unlocked' : 'locked',
      optional: newMilestoneOptional
    };
    
    const updatedMilestones = [...milestones, newMilestone];
    const { updatedMilestones: finalMilestones, newUnlocks } = updateMilestoneStates(updatedMilestones);
    
    newUnlocks.forEach(unlockedMilestone => {
      addCommunication('milestone_unlocked', unlockedMilestone);
      addCommunication('milestone_unlocked_followup', unlockedMilestone, 3);
      addCommunication('milestone_unlocked_followup', unlockedMilestone, 7);
    });
    
    setMilestones(finalMilestones);
    setNewMilestoneName('');
  };

  const changeState = (id, newState) => {
    const milestoneIndex = milestones.findIndex(m => m.id === id);
    const milestone = milestones[milestoneIndex];
    const oldState = milestone.state;
    
    if (
      (oldState === 'completed' && (newState === 'unlocked' || newState === 'locked')) ||
      (oldState === 'unlocked' && newState === 'locked')
    ) {
      return;
    }
    
    if (oldState !== 'unlocked' && newState === 'unlocked') {
      const updatedMilestone = { ...milestone, state: newState };
      addCommunication('milestone_unlocked', updatedMilestone);
      addCommunication('milestone_unlocked_followup', updatedMilestone, 3);
      addCommunication('milestone_unlocked_followup', updatedMilestone, 7);
    }
    
    const initialUpdate = milestones.map(milestone => 
      milestone.id === id ? { ...milestone, state: newState } : milestone
    );
    
    const { updatedMilestones, newUnlocks } = updateMilestoneStates(initialUpdate);
    
    newUnlocks.forEach(unlockedMilestone => {
      if (unlockedMilestone.id !== id) {
        addCommunication('milestone_unlocked', unlockedMilestone);
        addCommunication('milestone_unlocked_followup', unlockedMilestone, 3);
        addCommunication('milestone_unlocked_followup', unlockedMilestone, 7);
      }
    });
    
    setMilestones(updatedMilestones);
  };

  const changeType = (id, newType) => {
    const updatedMilestones = milestones.map(milestone => 
      milestone.id === id ? { ...milestone, type: newType } : milestone
    );
    setMilestones(updatedMilestones);
  };

  const toggleOptional = (id) => {
    const updatedMilestones = milestones.map(milestone => 
      milestone.id === id ? { ...milestone, optional: !milestone.optional } : milestone
    );
    
    const { updatedMilestones: finalMilestones, newUnlocks } = updateMilestoneStates(updatedMilestones);
    
    newUnlocks.forEach(unlockedMilestone => {
      addCommunication('milestone_unlocked', unlockedMilestone);
      addCommunication('milestone_unlocked_followup', unlockedMilestone, 3);
      addCommunication('milestone_unlocked_followup', unlockedMilestone, 7);
    });
    
    setMilestones(finalMilestones);
  };

  const removeMilestone = (id) => {
    const filteredMilestones = milestones.filter(milestone => milestone.id !== id);
    const { updatedMilestones, newUnlocks } = updateMilestoneStates(filteredMilestones);
    
    newUnlocks.forEach(unlockedMilestone => {
      addCommunication('milestone_unlocked', unlockedMilestone);
      addCommunication('milestone_unlocked_followup', unlockedMilestone, 3);
      addCommunication('milestone_unlocked_followup', unlockedMilestone, 7);
    });
    
    setMilestones(updatedMilestones);
  };

  return {
    milestones,
    setMilestones,
    newMilestoneName,
    setNewMilestoneName,
    newMilestoneType,
    setNewMilestoneType,
    newMilestoneOptional,
    setNewMilestoneOptional,
    newMilestoneStartDate,
    setNewMilestoneStartDate,
    newMilestoneEndDate,
    setNewMilestoneEndDate,
    addMilestone,
    changeState,
    changeType,
    toggleOptional,
    removeMilestone
  };
}; 