import React, { useState } from 'react';
import PlanDetailsPanel from './components/PlanDetailsPanel/PlanDetailsPanel';
import HealthChecksPanel from './components/HealthChecksPanel/HealthChecksPanel';
import NavigationSidebar from './components/NavigationSidebar/NavigationSidebar';
import MilestonesTable from './components/MilestonesTable/MilestonesTable';
import { mockPlanData, mockMilestones, mockNavigationSections } from './data/mockData';

const AdminPanel = () => {
  const [planData, setPlanData] = useState(mockPlanData);
  const [milestones, setMilestones] = useState(mockMilestones);

  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontSize: '11px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header - exact match to screenshot */}
      <div className="bg-white border-b border-gray-300 px-4 py-2 flex justify-between items-center">
        <h1 className="text-lg font-normal text-black">
          AI Flight School (Cohort 11 & 12)
        </h1>
        <button className="text-blue-600 hover:text-blue-700 text-xs">
          Edit Guided Journey Plan
        </button>
      </div>

      {/* Main Content - Exact 3 column layout with proper widths */}
      <div className="flex">
        {/* Left Column - Plan Details */}
        <div className="bg-white border-r border-gray-300" style={{ width: '280px', minHeight: '70vh' }}>
          <PlanDetailsPanel 
            planData={planData} 
            setPlanData={setPlanData}
          />
        </div>

        {/* Center Column - Plan Health Checks */}
        <div className="flex-1 bg-white border-r border-gray-300" style={{ minHeight: '70vh' }}>
          <HealthChecksPanel 
            healthChecks={planData.healthChecks}
            setPlanData={setPlanData}
          />
        </div>

        {/* Right Column - Navigation */}
        <div className="bg-white" style={{ width: '280px', minHeight: '70vh' }}>
          <NavigationSidebar sections={mockNavigationSections} />
        </div>
      </div>

      {/* Bottom Section - Milestones Table with proper separation */}
      <div className="bg-gray-100 px-4 py-1">
        <div className="text-xs text-gray-600">Milestones subject to completion when all required preceding milestones are completed.</div>
      </div>
      
      <div className="bg-white">
        <MilestonesTable 
          milestones={milestones}
          setMilestones={setMilestones}
        />
      </div>
    </div>
  );
};

export default AdminPanel;