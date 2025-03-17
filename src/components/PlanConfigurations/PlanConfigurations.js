import React from 'react';
import PropTypes from 'prop-types';
import { UNLOCK_STRATEGIES } from '../utils';

const PlanConfigurations = ({ unlockStrategy, setUnlockStrategy }) => {
  const handleUnlockStrategyChange = (e) => {
    setUnlockStrategy(e.target.value);
  };

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h2 className="text-xl font-semibold mb-3">Plan Configurations</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Unlocking Strategy
        </label>
        <div className="space-y-2">
          <div className="flex items-start">
            <input
              id="unlock-by-date"
              name="unlockStrategy"
              type="radio"
              value={UNLOCK_STRATEGIES.BY_DATE}
              checked={unlockStrategy === UNLOCK_STRATEGIES.BY_DATE}
              onChange={handleUnlockStrategyChange}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300"
            />
            <label htmlFor="unlock-by-date" className="ml-2 block text-sm text-gray-700">
              <span className="font-medium">By start date passed</span>
              <p className="text-gray-500 text-xs mt-1">
                Milestones unlock when their start date has passed.
              </p>
            </label>
          </div>
          
          <div className="flex items-start">
            <input
              id="unlock-by-completion"
              name="unlockStrategy"
              type="radio"
              value={UNLOCK_STRATEGIES.BY_COMPLETION}
              checked={unlockStrategy === UNLOCK_STRATEGIES.BY_COMPLETION}
              onChange={handleUnlockStrategyChange}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300"
            />
            <label htmlFor="unlock-by-completion" className="ml-2 block text-sm text-gray-700">
              <span className="font-medium">By completion of all prior non-optional milestones</span>
              <p className="text-gray-500 text-xs mt-1">
                Milestones unlock when all preceding required milestones are completed.
              </p>
            </label>
          </div>
          
          <div className="flex items-start">
            <input
              id="unlock-by-both"
              name="unlockStrategy"
              type="radio"
              value={UNLOCK_STRATEGIES.BY_BOTH}
              checked={unlockStrategy === UNLOCK_STRATEGIES.BY_BOTH}
              onChange={handleUnlockStrategyChange}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300"
            />
            <label htmlFor="unlock-by-both" className="ml-2 block text-sm text-gray-700">
              <span className="font-medium">By start date passed and completion of all prior non-optional milestones</span>
              <p className="text-gray-500 text-xs mt-1">
                Milestones unlock when both their start date has passed and all preceding required milestones are completed.
              </p>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

PlanConfigurations.propTypes = {
  unlockStrategy: PropTypes.string.isRequired,
  setUnlockStrategy: PropTypes.func.isRequired
};

export default PlanConfigurations; 