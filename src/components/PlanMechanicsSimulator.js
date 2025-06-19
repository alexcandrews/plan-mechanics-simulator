import React, { useState, useCallback, useEffect } from 'react';
import AddMilestone from './AddMilestone/AddMilestone';
import MilestoneList from './MilestoneList/MilestoneList';
import CommunicationsSchedule from './CommunicationsSchedule/CommunicationsSchedule';
import CommunicationsRules from './CommunicationsRules/CommunicationsRules';
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
  const [startDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [unlockStrategy, setUnlockStrategy] = useState(initialUnlockStrategy);

  const [communicationRules, setCommunicationRules] = useState({
    planStatus: { enabled: true },
    milestoneUnlocked: {
      enabled: true,
      days: 3,
      applyToChapters: true,
      applyToSessions: false,
      ignoreOptional: true,
      furthestOnly: true
    },
    sessionReminder: {
      enabled: true,
      days: 2
    }
  });

  const [pendingCommunications, setPendingCommunications] = useState([]);

  const [newMilestoneStartDate, setNewMilestoneStartDate] = useState(new Date());
  const [newMilestoneEndDate, setNewMilestoneEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  
  const { communications, addCommunication, resetCommunications } = useCommunications();
  
  const scheduleCommunication = useCallback((comm) => {
    setPendingCommunications(prev => {
      let newComms = [...prev];
      // If the "furthest only" rule is active, clear out other pending unlocked comms.
      if (comm.rule === 'milestoneUnlocked' && communicationRules.milestoneUnlocked.furthestOnly) {
        newComms = newComms.filter(p => p.rule !== 'milestoneUnlocked');
      }
      
      const sendDate = new Date(currentDate);
      sendDate.setDate(sendDate.getDate() + comm.daysOffset);

      newComms.push({ ...comm, sendDate });
      return newComms;
    });
  }, [communicationRules.milestoneUnlocked.furthestOnly, currentDate]);
  
  const { handleMilestoneStateChange } = useMilestoneCommunications(communicationRules, scheduleCommunication);

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

  useEffect(() => {
    // --- Communications Engine ---
    const now = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const { planStatus, sessionReminder } = communicationRules;

    // Rule: Plan Started
    const planStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    if (planStatus.enabled && now.getTime() === planStartDate.getTime()) {
      if (!communications.some(c => c.type === 'Plan Started')) {
        addCommunication({
          id: Date.now() + Math.random(),
          type: 'Plan Started',
          date: new Date(currentDate),
          milestone: null
        });
      }
    }

    // Rule: Plan Completed
    const allRequiredCompleted = milestones
      .filter(m => !m.optional)
      .every(m => m.state === 'completed');
      
    if (planStatus.enabled && allRequiredCompleted) {
      // To prevent sending this every day after completion, we should ideally check
      // if it was already sent. For this simulator, we'll send it once.
      if (!communications.some(c => c.type === 'Plan Completed')) {
        addCommunication({
          id: Date.now() + Math.random(),
          type: 'Plan Completed',
          date: new Date(currentDate),
          milestone: null
        });
      }
    }

    const newPendingComms = [];
    pendingCommunications.forEach(comm => {
      const commSendDate = new Date(comm.sendDate.getFullYear(), comm.sendDate.getMonth(), comm.sendDate.getDate());

      if (now.getTime() === commSendDate.getTime()) {
        const milestone = milestones.find(m => m.id === comm.milestoneId);
        if (milestone) {
          addCommunication({
            id: Date.now() + Math.random(),
            type: `Unlocked Follow-up: ${milestone.name}`,
            date: new Date(currentDate),
            milestone
          });
        }
      } else if (now.getTime() < commSendDate.getTime()) {
        newPendingComms.push(comm);
      }
    });

    // Rule: Session Reminder
    if (sessionReminder.enabled) {
      milestones.forEach(milestone => {
        if (milestone.type === 'session' && milestone.startDate) {
          const reminderDate = new Date(milestone.startDate);
          reminderDate.setDate(reminderDate.getDate() - sessionReminder.days);
          const reminderDateOnly = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate());

          if(now.getTime() === reminderDateOnly.getTime()) {
            const reminderType = `Session Reminder: ${milestone.name}`;
            if (!communications.some(c => c.type === reminderType && c.milestone?.id === milestone.id)) {
              addCommunication({
                id: Date.now() + Math.random(),
                type: reminderType,
                date: new Date(currentDate),
                milestone
              });
            }
          }
        }
      });
    }

    if (newPendingComms.length !== pendingCommunications.length) {
      setPendingCommunications(newPendingComms);
    }
    // --- End Communications Engine ---

  }, [pendingCommunications, addCommunication, milestones, communicationRules, startDate, communications, currentDate]);

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
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Plan Mechanics Simulator</h1>
          <p className="text-lg text-gray-600">
            A tool to visualize and test the unlocking and communication logic of guided plans.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <PlanConfigurations
            unlockStrategy={unlockStrategy}
            setUnlockStrategy={handleUnlockStrategyChange}
            resetPlanMilestones={resetPlanMilestones}
          />
          <CommunicationsRules
            rules={communicationRules}
            setRules={setCommunicationRules}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <main className="md:col-span-2 space-y-6">
            <AddMilestone
              newMilestoneName={newMilestoneName}
              setNewMilestoneName={setNewMilestoneName}
              newMilestoneType={newMilestoneType}
              setNewMilestoneType={setNewMilestoneType}
              newMilestoneOptional={newMilestoneOptional}
              setNewMilestoneOptional={setNewMilestoneOptional}
              newMilestoneStartDate={newMilestoneStartDate}
              setNewMilestoneStartDate={setNewMilestoneStartDate}
              newMilestoneEndDate={newMilestoneEndDate}
              setNewMilestoneEndDate={setNewMilestoneEndDate}
              addMilestone={addMilestone}
              handleKeyPress={handleKeyPress}
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
          </main>
          
          <aside className="space-y-6">
            <CommunicationsSchedule communications={communications} />
          </aside>
        </div>

        <CurrentDateControl 
          currentDate={currentDate}
          onDateChange={handleDateChange}
          onNextDay={handleNextDay}
        />
      </div>
    </div>
  );
};

export default PlanMechanicsSimulator; 