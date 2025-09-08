import React from 'react';

const HealthChecksPanel = ({ healthChecks, setPlanData }) => {
  const handleToggleEnabled = (id) => {
    setPlanData(prev => ({
      ...prev,
      healthChecks: prev.healthChecks.map(check =>
        check.id === id ? { ...check, enabled: !check.enabled } : check
      )
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'bg-red-600 text-white px-1.5 py-0.5 text-xs font-medium rounded';
      case 'P2': return 'bg-blue-600 text-white px-1.5 py-0.5 text-xs font-medium rounded';
      default: return 'bg-gray-500 text-white px-1.5 py-0.5 text-xs font-medium rounded';
    }
  };

  return (
    <div className="h-full overflow-y-auto" style={{ fontSize: '11px' }}>
      {/* Plan Health Checks Section - Exact match to screenshot */}
      <div className="px-4 py-3 bg-gray-100 border-b border-gray-300">
        <div className="text-xs text-gray-600 mb-3">
          Build and deployment have been checked to make sure that they are compliant with plan requirements.
        </div>
        
        <div className="space-y-2">
          {healthChecks.map((check) => (
            <div key={check.id} className="flex items-start space-x-2 py-1">
              <input
                type="checkbox"
                checked={check.enabled}
                onChange={() => handleToggleEnabled(check.id)}
                className="w-3 h-3 mt-0.5 flex-shrink-0"
              />
              <span className={getPriorityColor(check.priority)}>
                {check.priority}
              </span>
              <div className="flex-1">
                <div className="text-xs text-black font-medium mb-0.5">
                  {check.condition}
                </div>
                <div className="text-xs text-gray-600">
                  {check.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Settings Section - matches screenshot layout */}
      <div className="px-4 py-3">
        <div className="mb-4 pb-2">
          <h3 className="text-xs font-medium text-black mb-2">
            Communication settings
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 uppercase" style={{ fontSize: '10px' }}>
                COMMUNICATION SCHEDULES
              </span>
              <button className="text-xs text-blue-600 hover:text-blue-700 underline">
                Edit
              </button>
            </div>
            <div className="text-xs text-black">Default</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 uppercase" style={{ fontSize: '10px' }}>
                COURSE TRANSCRIPT
              </span>
              <button className="text-xs text-blue-600 hover:text-blue-700 underline">
                Default
              </button>
            </div>
          </div>
        </div>

        {/* Communication Rules Table - exact match to screenshot */}
        <div className="mt-4">
          <h4 className="text-xs font-medium text-black mb-2">
            Communication rules
          </h4>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse" style={{ fontSize: '10px' }}>
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 text-left font-medium text-gray-600 uppercase border border-gray-300">RULE</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-600 uppercase border border-gray-300">NAME</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-600 uppercase border border-gray-300">ENABLED</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-600 uppercase border border-gray-300">TRIGGER TYPE</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-600 uppercase border border-gray-300">TRIGGER OFFSET / MINUTES</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-600 uppercase border border-gray-300">TIME OF DAY TO SEND</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-600 uppercase border border-gray-300">DIGEST DAY OF WEEK</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-2 py-1 text-black border border-gray-300">1</td>
                  <td className="px-2 py-1 text-black border border-gray-300">Plan Started</td>
                  <td className="px-2 py-1 text-center border border-gray-300">
                    <input type="checkbox" defaultChecked className="w-3 h-3" />
                  </td>
                  <td className="px-2 py-1 text-black border border-gray-300">immediate</td>
                  <td className="px-2 py-1 text-black text-center border border-gray-300">0</td>
                  <td className="px-2 py-1 text-black border border-gray-300">Not set</td>
                  <td className="px-2 py-1 text-black text-center border border-gray-300">-</td>
                </tr>
                <tr className="bg-gray-50 hover:bg-gray-100">
                  <td className="px-2 py-1 text-black border border-gray-300">2</td>
                  <td className="px-2 py-1 text-black border border-gray-300">Milestone Unlocked</td>
                  <td className="px-2 py-1 text-center border border-gray-300">
                    <input type="checkbox" defaultChecked className="w-3 h-3" />
                  </td>
                  <td className="px-2 py-1 text-black border border-gray-300">immediate</td>
                  <td className="px-2 py-1 text-black text-center border border-gray-300">0</td>
                  <td className="px-2 py-1 text-black border border-gray-300">Not set</td>
                  <td className="px-2 py-1 text-black text-center border border-gray-300">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthChecksPanel;