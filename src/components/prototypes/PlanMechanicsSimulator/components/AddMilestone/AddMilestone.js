import React from 'react';
import { formatDateForInput } from '../../utils/utils';

const AddMilestone = ({
  newMilestoneName,
  setNewMilestoneName,
  newMilestoneType,
  setNewMilestoneType,
  newMilestoneOptional,
  setNewMilestoneOptional,
  addMilestone,
  handleKeyPress,
  newMilestoneStartDate,
  setNewMilestoneStartDate,
  newMilestoneEndDate,
  setNewMilestoneEndDate
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Add New Milestone</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Milestone Name"
          className="p-2 border rounded flex-grow"
          value={newMilestoneName}
          onChange={(e) => setNewMilestoneName(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <select
          className="p-2 border rounded"
          value={newMilestoneType}
          onChange={(e) => setNewMilestoneType(e.target.value)}
        >
          <option value="milestone">Milestone</option>
          <option value="session">Session</option>
        </select>
        <div className="flex items-center p-2">
          <input
            type="checkbox"
            id="newMilestoneOptional"
            checked={newMilestoneOptional}
            onChange={(e) => setNewMilestoneOptional(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="newMilestoneOptional" className="text-sm">Optional</label>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center">
          <label htmlFor="startDate" className="mr-2 text-sm">Start Date:</label>
          <input
            type="date"
            id="startDate"
            className="p-2 border rounded"
            value={formatDateForInput(newMilestoneStartDate)}
            onChange={(e) => setNewMilestoneStartDate(new Date(e.target.value))}
          />
        </div>
        <div className="flex items-center">
          <label htmlFor="endDate" className="mr-2 text-sm">End Date:</label>
          <input
            type="date"
            id="endDate"
            className="p-2 border rounded"
            value={formatDateForInput(newMilestoneEndDate)}
            onChange={(e) => setNewMilestoneEndDate(new Date(e.target.value))}
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
          onClick={addMilestone}
        >
          Add Milestone
        </button>
      </div>
    </div>
  );
};

export default AddMilestone; 