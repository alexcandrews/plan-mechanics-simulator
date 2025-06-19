import React from 'react';
import PropTypes from 'prop-types';
import { getStateColor, getTypeIcon, formatDateForInput } from '../utils';
import { milestoneType } from '../types';

const MilestoneList = ({
  milestones,
  changeState,
  changeType,
  toggleOptional,
  removeMilestone,
  changeStartDate,
  changeEndDate
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Plan ({milestones.length} milestones)</h2>
      
      {milestones.length === 0 ? (
        <p className="text-gray-500 italic">No milestones added yet. Add your first milestone above.</p>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div 
              key={milestone.id}
              className={`border-l-4 p-4 rounded-lg flex justify-between items-center ${getStateColor(milestone.state)}`}
            >
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  {getTypeIcon(milestone.type)}
                  <span className="font-semibold">{milestone.name}</span>
                  <span className="text-sm text-gray-600">({milestone.type})</span>
                  {milestone.optional && 
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Optional</span>
                  }
                </div>
                
                <div className="mt-2 flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <span className="text-sm mr-2">State:</span>
                    <select
                      className="p-1 border rounded text-sm"
                      value={milestone.state}
                      onChange={(e) => changeState(milestone.id, e.target.value)}
                    >
                      <option value="locked" disabled={milestone.state !== 'locked'}>🔴 Locked</option>
                      <option value="unlocked" disabled={milestone.state === 'completed'}>🟡 Unlocked</option>
                      <option value="completed">🟢 Completed</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm mr-2">Type:</span>
                    <select
                      className="p-1 border rounded text-sm"
                      value={milestone.type}
                      onChange={(e) => changeType(milestone.id, e.target.value)}
                    >
                      <option value="milestone">🏆 Milestone</option>
                      <option value="session">📝 Session</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={milestone.optional}
                        onChange={() => toggleOptional(milestone.id)}
                        className="mr-2"
                      />
                      <span className="text-sm">Optional</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <span className="text-sm mr-2">Start:</span>
                      <input
                        type="date"
                        value={formatDateForInput(milestone.startDate)}
                        onChange={(e) => changeStartDate(milestone.id, new Date(e.target.value))}
                        className="p-1 border rounded text-sm"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm mr-2">End:</span>
                      <input
                        type="date"
                        value={formatDateForInput(milestone.endDate)}
                        onChange={(e) => changeEndDate(milestone.id, new Date(e.target.value))}
                        className="p-1 border rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                className="text-red-500 p-2 hover:bg-red-50 rounded"
                onClick={() => removeMilestone(milestone.id)}
                aria-label="Remove milestone"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

MilestoneList.propTypes = {
  milestones: PropTypes.arrayOf(milestoneType).isRequired,
  changeState: PropTypes.func.isRequired,
  changeType: PropTypes.func.isRequired,
  toggleOptional: PropTypes.func.isRequired,
  removeMilestone: PropTypes.func.isRequired,
  changeStartDate: PropTypes.func.isRequired,
  changeEndDate: PropTypes.func.isRequired
};

export default MilestoneList; 