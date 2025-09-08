import React from 'react';

const PlanDetailsPanel = ({ planData, setPlanData }) => {
  const { basic, dates, settings } = planData;

  const handleInputChange = (section, field, value) => {
    setPlanData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="h-full p-4 text-xs">
      {/* Header */}
      <div className="mb-4 pb-2 border-b border-gray-200">
        <h2 className="text-sm font-normal text-black">
          Guided Journey Plan Details
        </h2>
      </div>

      <div className="space-y-3">
        {/* Basic Information */}
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              GUID
            </label>
            <div className="text-xs text-black bg-gray-50 p-1 border border-gray-200 rounded">
              {basic.guid}
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              BUSINESS NAME
            </label>
            <div className="text-xs text-black">
              {basic.businessName}
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              PLAN NAME  
            </label>
            <div className="text-xs text-black">
              {basic.planName}
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              DESCRIPTION
            </label>
            <div className="text-xs text-black">
              {basic.description}
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              STATUS
            </label>
            <div className="text-xs text-black">
              Active
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              STARTS AT
            </label>
            <div className="text-xs text-black">
              {dates.startDate}
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              PUBLISHED AT
            </label>
            <div className="text-xs text-black">
              {dates.endDate}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              DUE DATES ENABLED
            </label>
            <div className="text-xs text-black">
              True
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              MILESTONE UNLOCKING STRATEGY
            </label>
            <div className="text-xs text-black">
              By completion when all required preceding milestones are completed.
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              PLAN LENGTH
            </label>
            <div className="flex items-center space-x-2 mb-1">
              <input
                type="checkbox"
                checked={true}
                className="w-3 h-3"
                readOnly
              />
              <span className="text-xs text-black">Auto-calculate</span>
            </div>
          </div>
        </div>

        {/* Additional Fields from Screenshot */}
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              PLAN ENGAGEMENT
            </label>
            <div className="text-xs text-black">
              Online
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              PLAN SETTING
            </label>
            <div className="text-xs text-black">
              <span className="text-red-600">LIVE</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              ACTIVITY
            </label>
            <div className="text-xs text-blue-600 underline cursor-pointer">
              30 Engaged
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              PLAN PERFORMANCE
            </label>
            <div className="text-xs text-blue-600 underline cursor-pointer">
              39 milestones
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              COMMUNICATIONS METRICS
            </label>
            <div className="text-xs text-blue-600 underline cursor-pointer">
              22 Rules School COACH
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              CREATED AT
            </label>
            <div className="text-xs text-black">
              Jun 3, 2025 at 04:00 AM PDT
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              UPDATED AT
            </label>
            <div className="text-xs text-black">
              Jul 3, 2025 at 04:00 PM PDT
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-600 mb-1 uppercase">
              MOBILE ONLY
            </label>
            <div className="text-xs text-black">
              Enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailsPanel;