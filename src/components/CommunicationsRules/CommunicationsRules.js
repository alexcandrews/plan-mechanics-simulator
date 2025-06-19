// src/components/CommunicationsRules/CommunicationsRules.js
import React from 'react';
import PropTypes from 'prop-types';

const CommunicationsRules = ({ rules, setRules }) => {
  const handleRuleChange = (rule, key, value) => {
    setRules(prevRules => ({
      ...prevRules,
      [rule]: {
        ...prevRules[rule],
        [key]: value
      }
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow h-full">
      <h2 className="text-xl font-semibold mb-4">Communication Rules</h2>
      
      <div className="space-y-6">
        {/* Rule 1: Plan Status Change */}
        <div className="p-4 border rounded-md">
          <h3 className="font-medium text-md mb-2">Plan Status Emails</h3>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={rules.planStatus.enabled}
              onChange={(e) => handleRuleChange('planStatus', 'enabled', e.target.checked)}
            />
            <span>Send email when Plan started/completed</span>
          </label>
        </div>

        {/* Rule 2: Milestone Unlocked Follow-up */}
        <div className="p-4 border rounded-md">
          <h3 className="font-medium text-md mb-2">Milestone Unlocked Follow-up</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rules.milestoneUnlocked.enabled}
                onChange={(e) => handleRuleChange('milestoneUnlocked', 'enabled', e.target.checked)}
              />
              <span>Send email</span>
              <input
                type="number"
                className="w-16 p-1 border rounded"
                value={rules.milestoneUnlocked.days}
                onChange={(e) => handleRuleChange('milestoneUnlocked', 'days', parseInt(e.target.value, 10))}
                disabled={!rules.milestoneUnlocked.enabled}
              />
              <span>days after milestone unlocked</span>
            </label>
            <div className="pl-6 text-sm space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rules.milestoneUnlocked.ignoreOptional}
                  onChange={(e) => handleRuleChange('milestoneUnlocked', 'ignoreOptional', e.target.checked)}
                  disabled={!rules.milestoneUnlocked.enabled}
                />
                <span>Ignore optional milestones</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rules.milestoneUnlocked.furthestOnly}
                  onChange={(e) => handleRuleChange('milestoneUnlocked', 'furthestOnly', e.target.checked)}
                  disabled={!rules.milestoneUnlocked.enabled}
                />
                <span>Only send for furthest unlocked milestone</span>
              </label>
              <div>
                <span className="mr-4">Apply to:</span>
                <label className="inline-flex items-center space-x-2 mr-4">
                  <input
                    type="checkbox"
                    checked={rules.milestoneUnlocked.applyToChapters}
                    onChange={(e) => handleRuleChange('milestoneUnlocked', 'applyToChapters', e.target.checked)}
                    disabled={!rules.milestoneUnlocked.enabled}
                  />
                  <span>Chapters</span>
                </label>
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={rules.milestoneUnlocked.applyToSessions}
                    onChange={(e) => handleRuleChange('milestoneUnlocked', 'applyToSessions', e.target.checked)}
                    disabled={!rules.milestoneUnlocked.enabled}
                  />
                  <span>Sessions</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Rule 3: Session Reminder */}
        <div className="p-4 border rounded-md">
          <h3 className="font-medium text-md mb-2">Session Reminder</h3>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={rules.sessionReminder.enabled}
              onChange={(e) => handleRuleChange('sessionReminder', 'enabled', e.target.checked)}
            />
            <span>Send reminder</span>
            <input
              type="number"
              className="w-16 p-1 border rounded"
              value={rules.sessionReminder.days}
              onChange={(e) => handleRuleChange('sessionReminder', 'days', parseInt(e.target.value, 10))}
              disabled={!rules.sessionReminder.enabled}
            />
            <span>days before session start date</span>
          </label>
        </div>
      </div>
    </div>
  );
};

CommunicationsRules.propTypes = {
  rules: PropTypes.object.isRequired,
  setRules: PropTypes.func.isRequired,
};

export default CommunicationsRules; 