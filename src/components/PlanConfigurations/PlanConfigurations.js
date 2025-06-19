// src/components/PlanConfigurations/PlanConfigurations.js
import React from 'react';
import PropTypes from 'prop-types';
import { UNLOCK_STRATEGIES } from '../utils';

const PlanConfigurations = ({
  unlockStrategy,
  setUnlockStrategy,
  resetPlanMilestones
}) => {
  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Plan Configurations</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Unlocking Strategy */}
        <div>
          <h3 className="text-lg font-medium mb-3">Unlocking Strategy</h3>
          <div className="space-y-2">
            <label className="flex items-start">
              <input
                type="radio"
                name="unlockStrategy"
                className="mt-1"
                checked={unlockStrategy === UNLOCK_STRATEGIES.BY_COMPLETION_ONLY}
                onChange={() => setUnlockStrategy(UNLOCK_STRATEGIES.BY_COMPLETION_ONLY)}
              />
              <span className="ml-2 text-sm text-left block">
                By Completion Only
                <p className="text-xs text-gray-500">Unlocks when all prior required milestones are completed. Start date is ignored.</p>
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="radio"
                name="unlockStrategy"
                className="mt-1"
                checked={unlockStrategy === UNLOCK_STRATEGIES.BY_UNLOCK_AT_ONLY}
                onChange={() => setUnlockStrategy(UNLOCK_STRATEGIES.BY_UNLOCK_AT_ONLY)}
              />
              <span className="ml-2 text-sm text-left block">
                By Start Date Only
                <p className="text-xs text-gray-500">Unlocks when the milestone's start date is reached. Prerequisite completion is ignored.</p>
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="radio"
                name="unlockStrategy"
                className="mt-1"
                checked={unlockStrategy === UNLOCK_STRATEGIES.BY_UNLOCK_AT_OR_COMPLETION}
                onChange={() => setUnlockStrategy(UNLOCK_STRATEGIES.BY_UNLOCK_AT_OR_COMPLETION)}
              />
              <span className="ml-2 text-sm text-left block">
                By Start Date <strong>OR</strong> Completion
                <p className="text-xs text-gray-500">Unlocks when the start date is reached OR prerequisites are complete (whichever comes first).</p>
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="radio"
                name="unlockStrategy"
                className="mt-1"
                checked={unlockStrategy === UNLOCK_STRATEGIES.BY_UNLOCK_AT_AND_COMPLETION}
                onChange={() => setUnlockStrategy(UNLOCK_STRATEGIES.BY_UNLOCK_AT_AND_COMPLETION)}
              />
              <span className="ml-2 text-sm text-left block">
                By Start Date <strong>AND</strong> Completion
                <p className="text-xs text-gray-500">Unlocks only when the start date is reached AND prerequisites are complete.</p>
              </span>
            </label>
          </div>
        </div>

        {/* Right Column - Completion Strategy */}
        <div>
          <h3 className="text-lg font-medium mb-3">Completion Strategy</h3>
          <div className="space-y-2">
            <label className="flex items-start">
              <input
                type="radio"
                className="mt-1"
                disabled
                checked={false}
              />
              <span className="ml-2 text-sm text-gray-500 text-left block">
                Complete milestones when all activities are clicked
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="radio"
                className="mt-1"
                disabled
                checked={false}
              />
              <span className="ml-2 text-sm text-gray-500 text-left block">
                Complete milestones when all activities are completed
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="radio"
                className="mt-1"
                disabled
                checked={false}
              />
              <span className="ml-2 text-sm text-gray-500 text-left block">
                Complete milestones when only assessment activities are completed
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-blue-200">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Due Dates */}
          <div>
            <h3 className="text-lg font-medium mb-3">Due Dates</h3>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  disabled
                  checked={false}
                />
                <span className="ml-2 text-sm text-gray-500">Enable due dates</span>
              </label>
            </div>
          </div>

          {/* Right Column - Comms */}
          <div>
            <h3 className="text-lg font-medium mb-3">Comms</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  disabled
                  checked
                />
                <span className="ml-2 text-sm text-gray-500">Plan Started</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  disabled
                  checked
                />
                <span className="ml-2 text-sm text-gray-500">Milestone Unlocked</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  disabled
                  checked
                />
                <span className="ml-2 text-sm text-gray-500">Milestone Unlocked + 3 days</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  disabled
                  checked
                />
                <span className="ml-2 text-sm text-gray-500">Milestone Unlocked + 7 days</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-blue-200">
        <div className="flex justify-start">
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-left"
            onClick={resetPlanMilestones}
          >
            Reset Plan
          </button>
        </div>
      </div>
    </div>
  );
};

PlanConfigurations.propTypes = {
  unlockStrategy: PropTypes.string.isRequired,
  setUnlockStrategy: PropTypes.func.isRequired,
  resetPlanMilestones: PropTypes.func.isRequired
};

export default PlanConfigurations;