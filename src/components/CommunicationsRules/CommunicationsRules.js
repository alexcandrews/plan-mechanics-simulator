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
      
      <div className="space-y-4">
        {/* Rule 1: Plan Status Change */}
        <label className="flex items-start">
          <input
            type="checkbox"
            className="mt-1"
            checked={rules.planStatus.enabled}
            onChange={(e) => handleRuleChange('planStatus', 'enabled', e.target.checked)}
          />
          <span className="ml-2 text-sm text-left block">
            Plan Status Emails
            <p className="text-xs text-gray-500">Send email when Plan started or completed.</p>
          </span>
        </label>

        {/* Rule 2: Milestone Unlocked Follow-up */}
        <label className="flex items-start">
          <input
            type="checkbox"
            className="mt-1"
            checked={rules.milestoneUnlocked.enabled}
            onChange={(e) => handleRuleChange('milestoneUnlocked', 'enabled', e.target.checked)}
          />
          <span className="ml-2 text-sm text-left block">
            Milestone Unlocked Follow-up
            <p className="text-xs text-gray-500">
              Send
              <input
                type="number"
                className="w-12 p-1 border rounded mx-1"
                value={rules.milestoneUnlocked.days}
                onChange={(e) => handleRuleChange('milestoneUnlocked', 'days', parseInt(e.target.value, 10))}
                disabled={!rules.milestoneUnlocked.enabled}
              />
              days after unlock.
            </p>
            <div className="mt-2 space-y-2 text-xs text-gray-500">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rules.milestoneUnlocked.ignoreOptional}
                  onChange={(e) => handleRuleChange('milestoneUnlocked', 'ignoreOptional', e.target.checked)}
                  disabled={!rules.milestoneUnlocked.enabled}
                />
                <span>Ignore optional milestones</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rules.milestoneUnlocked.furthestOnly}
                  onChange={(e) => handleRuleChange('milestoneUnlocked', 'furthestOnly', e.target.checked)}
                  disabled={!rules.milestoneUnlocked.enabled}
                />
                <span>Only send for furthest unlocked</span>
              </label>
              <div className="flex items-center">
                <span className="mr-2">Apply to:</span>
                <label className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={rules.milestoneUnlocked.applyToChapters}
                    onChange={(e) => handleRuleChange('milestoneUnlocked', 'applyToChapters', e.target.checked)}
                    disabled={!rules.milestoneUnlocked.enabled}
                  />
                  <span>Chapters</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={rules.milestoneUnlocked.applyToSessions}
                    onChange={(e) => handleRuleChange('milestoneUnlocked', 'applyToSessions', e.target.checked)}
                    disabled={!rules.milestoneUnlocked.enabled}
                  />
                  <span>Sessions</span>
                </label>
              </div>
            </div>
          </span>
        </label>

        {/* Rule 3: Session Reminder */}
        <label className="flex items-start">
          <input
            type="checkbox"
            className="mt-1"
            checked={rules.sessionReminder.enabled}
            onChange={(e) => handleRuleChange('sessionReminder', 'enabled', e.target.checked)}
          />
          <span className="ml-2 text-sm text-left block">
            Session Reminder
            <p className="text-xs text-gray-500">
              Send reminder
              <input
                type="number"
                className="w-12 p-1 border rounded mx-1"
                value={rules.sessionReminder.days}
                onChange={(e) => handleRuleChange('sessionReminder', 'days', parseInt(e.target.value, 10))}
                disabled={!rules.sessionReminder.enabled}
              />
              days before session start date.
            </p>
          </span>
        </label>
      </div>
    </div>
  );
};

CommunicationsRules.propTypes = {
  rules: PropTypes.object.isRequired,
  setRules: PropTypes.func.isRequired,
};

export default CommunicationsRules; 