import React from 'react';
import PropTypes from 'prop-types';

const CurrentMilestoneDisplay = ({ currentMilestone }) => {
  const getReasonColor = (reason) => {
    switch (reason) {
      case 'First Unlocked Required Milestone':
        return 'text-green-600';
      case 'First Unlocked Optional Milestone':
        return 'text-blue-600';
      case 'Last Completed Milestone':
        return 'text-yellow-600';
      case 'First Milestone in Plan (Fallback)':
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 bg-white p-4 rounded-lg shadow-lg z-10 max-w-sm" style={{ bottom: '7rem' }}>
      {currentMilestone ? (
        <div className="text-gray-800 font-medium">
          Current Milestone: {currentMilestone.name}
        </div>
      ) : (
        <div className="text-gray-500 italic">
          No milestones available
        </div>
      )}
    </div>
  );
};

CurrentMilestoneDisplay.propTypes = {
  currentMilestone: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    reason: PropTypes.string.isRequired,
  })
};

export default CurrentMilestoneDisplay;