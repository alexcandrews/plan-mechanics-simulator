import React from 'react';

const MilestonesTable = ({ milestones, setMilestones }) => {
  const handleFieldChange = (id, field, value) => {
    setMilestones(prev => 
      prev.map(milestone => 
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    );
  };

  return (
    <div className="px-4 py-2" style={{ fontSize: '10px' }}>
      <div className="mb-3">
        <h2 className="text-xs font-medium text-black mb-1">
          Milestones
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-1 py-1 text-left font-medium text-gray-600 uppercase border border-gray-300" style={{ fontSize: '9px' }}>
                Name
              </th>
              <th className="px-1 py-1 text-center font-medium text-gray-600 uppercase border border-gray-300" style={{ fontSize: '9px' }}>
                Position
              </th>
              <th className="px-1 py-1 text-center font-medium text-gray-600 uppercase border border-gray-300" style={{ fontSize: '9px' }}>
                Milestone Type
              </th>
              <th className="px-1 py-1 text-center font-medium text-gray-600 uppercase border border-gray-300" style={{ fontSize: '9px' }}>
                Duration In Days
              </th>
              <th className="px-1 py-1 text-center font-medium text-gray-600 uppercase border border-gray-300" style={{ fontSize: '9px' }}>
                Member Default Status
              </th>
              <th className="px-1 py-1 text-center font-medium text-gray-600 uppercase border border-gray-300" style={{ fontSize: '9px' }}>
                Optional
              </th>
              <th className="px-1 py-1 text-center font-medium text-gray-600 uppercase border border-gray-300" style={{ fontSize: '9px' }}>
                Unlock At
              </th>
              <th className="px-1 py-1 text-center font-medium text-gray-600 uppercase border border-gray-300" style={{ fontSize: '9px' }}>
                Due At
              </th>
              <th className="px-1 py-1 text-center font-medium text-gray-600 uppercase border border-gray-300" style={{ fontSize: '9px' }}>
                # Activities
              </th>
              <th className="px-1 py-1 text-center font-medium text-gray-600 uppercase border border-gray-300" style={{ fontSize: '9px' }}>
                # Assessments
              </th>
              <th className="px-1 py-1 text-center font-medium text-gray-600 uppercase border border-gray-300" style={{ fontSize: '9px' }}>
                # Resources Activities
              </th>
              <th className="px-1 py-1 text-center font-medium text-gray-600 uppercase border border-gray-300" style={{ fontSize: '9px' }}>
                # Quotes
              </th>
              <th className="px-1 py-1 text-center font-medium text-gray-600 uppercase border border-gray-300" style={{ fontSize: '9px' }}>
                # Reflections
              </th>
              <th className="px-1 py-1 text-center font-medium text-gray-600 uppercase border border-gray-300" style={{ fontSize: '9px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((milestone, index) => (
              <tr key={milestone.id} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-1 py-0.5 border border-gray-300">
                  <span className="text-blue-600 underline cursor-pointer">
                    {milestone.name}
                  </span>
                </td>
                <td className="px-1 py-0.5 text-black text-center border border-gray-300">
                  {milestone.position}
                </td>
                <td className="px-1 py-0.5 text-black text-center border border-gray-300">
                  {milestone.milestoneType}
                </td>
                <td className="px-1 py-0.5 text-black text-center border border-gray-300">
                  {milestone.duration}
                </td>
                <td className="px-1 py-0.5 text-black text-center border border-gray-300">
                  {milestone.memberDefaultStatus}
                </td>
                <td className="px-1 py-0.5 text-center border border-gray-300">
                  <input
                    type="checkbox"
                    checked={milestone.optional}
                    onChange={(e) => handleFieldChange(milestone.id, 'optional', e.target.checked)}
                    className="w-2.5 h-2.5"
                  />
                </td>
                <td className="px-1 py-0.5 text-black text-center border border-gray-300">
                  {milestone.unlockAt}
                </td>
                <td className="px-1 py-0.5 text-black text-center border border-gray-300">
                  {milestone.dueAt}
                </td>
                <td className="px-1 py-0.5 text-black text-center border border-gray-300">
                  {milestone.activities}
                </td>
                <td className="px-1 py-0.5 text-black text-center border border-gray-300">
                  {milestone.assessments}
                </td>
                <td className="px-1 py-0.5 text-black text-center border border-gray-300">
                  {milestone.resources}
                </td>
                <td className="px-1 py-0.5 text-black text-center border border-gray-300">
                  {milestone.quotes}
                </td>
                <td className="px-1 py-0.5 text-black text-center border border-gray-300">
                  {milestone.reflections}
                </td>
                <td className="px-1 py-0.5 text-center border border-gray-300">
                  <button className="text-blue-600 underline hover:text-blue-700">
                    View/Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MilestonesTable;