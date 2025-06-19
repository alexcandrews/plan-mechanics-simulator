import React, { useState, useCallback, useEffect } from 'react';
import AddMilestone from './AddMilestone/AddMilestone';
import MilestoneList from './MilestoneList/MilestoneList';
import ProgressPath from './ProgressPath/ProgressPath';
import CommunicationsSchedule from './CommunicationsSchedule/CommunicationsSchedule';
import Rules from './Rules/Rules';
import PlanConfigurations from './PlanConfigurations/PlanConfigurations';
import CurrentDateControl from './CurrentDateControl/CurrentDateControl';
import { UNLOCK_STRATEGIES } from './utils';
import { useMilestones } from './hooks/useMilestones';
import { useCommunications } from './hooks/useCommunications';
import { useUnlockStrategies } from './hooks/useUnlockStrategies';
import { useMilestoneCommunications } from './hooks/useMilestoneCommunications';
import { initialUnlockStrategy } from './data/seeds';

const PlanMechanicsSimulator = () => {
  const startDate = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [unlockStrategy, setUnlockStrategy] = useState(initialUnlockStrategy);
  const [newMilestoneStartDate, setNewMilestoneStartDate] = useState(new Date());
  const [newMilestoneEndDate, setNewMilestoneEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  
  const { communications, addCommunication, resetCommunications } = useCommunications(startDate);
  
  const wrappedAddCommunication = useCallback((type, milestone, daysOffset = 0, options = {}) => {
    addCommunication(type, milestone, daysOffset, options, currentDate);
  }, [addCommunication, currentDate]);

  const { handleMilestoneStateChange } = useMilestoneCommunications(wrappedAddCommunication);

  const {
    milestones,
    setMilestones,
    newMilestoneName,
    setNewMilestoneName,
    newMilestoneType,
    setNewMilestoneType,
    newMilestoneOptional,
    setNewMilestoneOptional,
    addMilestone,
    changeState: originalChangeState,
    changeType,
    toggleOptional,
    removeMilestone
  } = useMilestones(handleMilestoneStateChange);

  const { updateMilestoneStates, changeState: strategyChangeState } = useUnlockStrategies(
    milestones,
    setMilestones,
    currentDate,
    unlockStrategy,
    handleMilestoneStateChange
  );

  // Wrap the original changeState to use strategy-based state changes
  const changeState = useCallback((id, newState) => {
    strategyChangeState(id, newState);
  }, [strategyChangeState]);

  const shouldAutoSetDates = useCallback((strategy) => {
    return [
      UNLOCK_STRATEGIES.BY_COMPLETION,
      UNLOCK_STRATEGIES.BY_DATE,
      UNLOCK_STRATEGIES.BY_BOTH
    ].includes(strategy);
  }, []);

  const updateMilestoneDates = useCallback((startingDate) => {
    setMilestones(prevMilestones => {
      let currentStartDate = new Date(startingDate);
      
      return prevMilestones.map(milestone => {
        const startDate = new Date(currentStartDate);
        const endDate = new Date(currentStartDate);
        endDate.setDate(endDate.getDate() + 7); // 7 days later
        
        // Set the next start date to be the current end date
        currentStartDate = new Date(endDate);
        
        return {
          ...milestone,
          startDate,
          endDate
        };
      });
    });
  }, []);

  useEffect(() => {
    updateMilestoneStates(currentDate);
  }, [currentDate, unlockStrategy, updateMilestoneStates]);

  const handleDateChange = useCallback((e) => {
    const dateStr = `${e.target.value}T00:00:00`;
    const newDate = new Date(dateStr);
    setCurrentDate(newDate);
  }, []);

  const handleUnlockStrategyChange = useCallback((newStrategy) => {
    setUnlockStrategy(newStrategy);
    // The useEffect will handle the update.
  }, []);

  // Initialize dates on component mount - this can be removed or simplified
  // as the main useEffect will now handle this.
  // For now, we'll leave it to ensure initial setup is correct.
  React.useEffect(() => {
    updateMilestoneDates(startDate);
  }, []); // Runs once on mount

  const handleNextDay = useCallback(() => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  }, [currentDate]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addMilestone();
    }
  };

  const resetPlanMilestones = () => {
    const newStrategy = initialUnlockStrategy;
    setUnlockStrategy(newStrategy);
    const today = new Date();
    setCurrentDate(today);
    
    const baseMilestones = [
      { 
        id: 1, 
        name: 'Milestone 1', 
        type: 'milestone', 
        state: 'unlocked', 
        optional: false,
        startDate: today,
        endDate: new Date(new Date().setDate(today.getDate() + 7))
      },
      { 
        id: 2, 
        name: 'Milestone 2', 
        type: 'milestone', 
        state: 'locked', 
        optional: true,
        startDate: new Date(new Date().setDate(today.getDate() + 7)),
        endDate: new Date(new Date().setDate(today.getDate() + 14))
      },
      { 
        id: 3, 
        name: 'Milestone 3', 
        type: 'milestone', 
        state: 'locked', 
        optional: false,
        startDate: new Date(new Date().setDate(today.getDate() + 14)),
        endDate: new Date(new Date().setDate(today.getDate() + 21))
      },
      { 
        id: 4, 
        name: 'Milestone 4', 
        type: 'milestone', 
        state: 'locked', 
        optional: false,
        startDate: new Date(new Date().setDate(today.getDate() + 21)),
        endDate: new Date(new Date().setDate(today.getDate() + 28))
      },
      { 
        id: 5, 
        name: 'Milestone 5', 
        type: 'milestone', 
        state: 'locked', 
        optional: false,
        startDate: new Date(new Date().setDate(today.getDate() + 28)),
        endDate: new Date(new Date().setDate(today.getDate() + 35))
      }
    ];

    setMilestones(baseMilestones);
    resetCommunications();
  };

  const changeStartDate = useCallback((id, newDate) => {
    setMilestones(prevMilestones => 
      prevMilestones.map(milestone => 
        milestone.id === id ? { ...milestone, startDate: newDate } : milestone
      )
    );
  }, []);

  const changeEndDate = useCallback((id, newDate) => {
    setMilestones(prevMilestones => 
      prevMilestones.map(milestone => 
        milestone.id === id ? { ...milestone, endDate: newDate } : milestone
      )
    );
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Plan Mechanics Simulator</h1>
      
      <CurrentDateControl 
        currentDate={currentDate}
        handleDateChange={handleDateChange}
        handleNextDay={handleNextDay}
      />
      
      <PlanConfigurations 
        unlockStrategy={unlockStrategy}
        setUnlockStrategy={handleUnlockStrategyChange}
        resetPlanMilestones={resetPlanMilestones}
      />
      
      <AddMilestone
        newMilestoneName={newMilestoneName}
        setNewMilestoneName={setNewMilestoneName}
        newMilestoneType={newMilestoneType}
        setNewMilestoneType={setNewMilestoneType}
        newMilestoneOptional={newMilestoneOptional}
        setNewMilestoneOptional={setNewMilestoneOptional}
        addMilestone={addMilestone}
        handleKeyPress={handleKeyPress}
        newMilestoneStartDate={newMilestoneStartDate}
        setNewMilestoneStartDate={setNewMilestoneStartDate}
        newMilestoneEndDate={newMilestoneEndDate}
        setNewMilestoneEndDate={setNewMilestoneEndDate}
      />
      
      <MilestoneList
        milestones={milestones}
        changeState={changeState}
        changeType={changeType}
        toggleOptional={toggleOptional}
        removeMilestone={removeMilestone}
        changeStartDate={changeStartDate}
        changeEndDate={changeEndDate}
      />
      
      <Rules />
      
      <ProgressPath milestones={milestones} />
      
      <CommunicationsSchedule
        communications={communications}
        startDate={startDate}
        currentDate={currentDate}
      />
    </div>
  );
};

export default PlanMechanicsSimulator; 