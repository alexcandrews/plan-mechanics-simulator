import React from 'react';

const GuidedJourney = () => {
  const planDetails = {
    guid: "VID-DEMO-XXX-DEMO-001",
    businessType: "AI Flight School Cohort F.8.43",
    description: "AI Flight School",
    program: "AI Flight School",
    status: "AI Flight School COHORT",
    createdAt: "Aug 3, 2025 at 05:00 AM PDT",
    publishedAt: "Aug 3, 2025 at 07:00 AM PDT",
    planOwner: "GEN",
    milestone: "NA (complete)",
    pathInCompletion: "NA (complete)"
  };

  const milestones = [
    { name: "Solo & Resources", position: 1, milestoneType: "chapter", duration: "0", memberDefault: "unlocked", actionable: "not set", unlockAt: "", dueAt: "Aug 3, 2025 at 05:00 AM PDT", activities: 2, assignments: 1, members: 1, quotes: 1, redirects: 1, actions: "View Edit" },
    { name: "Prep for Session 1", position: 2, milestoneType: "session", duration: "0", memberDefault: "unlocked", actionable: "not set", unlockAt: "", dueAt: "Aug 3, 2025 at 05:00 AM PDT", activities: 2, assignments: 1, members: 1, quotes: 1, redirects: 1, actions: "View Edit" },
    { name: "Live Session 1", position: 3, milestoneType: "session", duration: "0", memberDefault: "unlocked", actionable: "not set", unlockAt: "", dueAt: "Aug 3, 2025 at 05:00 AM PDT", activities: 5, assignments: 1, members: 1, quotes: 0, redirects: 0, actions: "View Edit" },
    { name: "Prep for Session 2", position: 4, milestoneType: "session", duration: "0", memberDefault: "unlocked", actionable: "not set", unlockAt: "", dueAt: "Aug 31, 2025 at 05:00 AM PDT", activities: 2, assignments: 1, members: 1, quotes: 0, redirects: 0, actions: "View Edit" },
    { name: "Live Session 2", position: 5, milestoneType: "session", duration: "0", memberDefault: "unlocked", actionable: "not set", unlockAt: "", dueAt: "Aug 31, 2025 at 05:00 AM PDT", activities: 2, assignments: 1, members: 1, quotes: 0, redirects: 0, actions: "View Edit" },
    { name: "Prep for Session 3", position: 6, milestoneType: "session", duration: "0", memberDefault: "locked", actionable: "not set", unlockAt: "Apr 21, 2025 at 05:00 AM PDT", dueAt: "", activities: 2, assignments: 1, members: 1, quotes: 0, redirects: 3, actions: "View Edit" },
    { name: "Live Session 3", position: 7, milestoneType: "session", duration: "0", memberDefault: "locked", actionable: "not set", unlockAt: "Jun 28, 2025 at 05:00 AM PDT", dueAt: "", activities: 2, assignments: 1, members: 1, quotes: 0, redirects: 0, actions: "View Edit" },
    { name: "Live Session 4", position: 8, milestoneType: "session", duration: "0", memberDefault: "locked", actionable: "not set", unlockAt: "Jun 24, 2025 at 05:00 AM PDT", dueAt: "", activities: 2, assignments: 1, members: 1, quotes: 0, redirects: 3, actions: "View Edit" },
    { name: "Live Session 5", position: 9, milestoneType: "session", duration: "0", memberDefault: "locked", actionable: "not set", unlockAt: "Jul 1, 2025 at 05:00 AM PDT", dueAt: "", activities: 2, assignments: 1, members: 1, quotes: 0, redirects: 0, actions: "View Edit" },
    { name: "Live Session 6", position: 10, milestoneType: "session", duration: "0", memberDefault: "locked", actionable: "not set", unlockAt: "Jul 5, 2025 at 05:00 AM PDT", dueAt: "", activities: 2, assignments: 1, members: 1, quotes: 0, redirects: 0, actions: "View Edit" },
    { name: "Live Session 7", position: 11, milestoneType: "session", duration: "0", memberDefault: "locked", actionable: "not set", unlockAt: "Jul 8, 2025 at 05:00 AM PDT", dueAt: "", activities: 2, assignments: 1, members: 1, quotes: 0, redirects: 0, actions: "View Edit" },
    { name: "AI Finish Cohort Conclusion", position: 14, milestoneType: "session", duration: "0", memberDefault: "locked", actionable: "not set", unlockAt: "Jul 8, 2025 at 05:00 AM PDT", dueAt: "", activities: 1, assignments: 1, members: 1, quotes: 0, redirects: 0, actions: "View Edit" }
  ];

  const navigationSections = {
    "Templating Engine": [
      "Plan Template"
    ],
    "Deployment Engine": [
      "Plan Template",
      "Plan Modules",
      "Communication Rules"
    ],
    "Actions": [
      "Email Body",
      "Email Page Redirects",
      "Create Summary From Plan"
    ],
    "Certificates": [
      "Create/Update/Delete Certificate for any Member",
      "Export Certificate (PDF) for any Member"
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AI Flight School (Cohort 11 & 12)</h1>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
            Exit Guided Journey Plan
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Plan Details */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Guided Journey Plan Details</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">GUID</label>
              <div className="text-sm text-gray-900">{planDetails.guid}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">BUSINESS TYPE</label>
              <div className="text-sm text-gray-900">{planDetails.businessType}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">DESCRIPTION</label>
              <div className="text-sm text-gray-900">{planDetails.description}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PROGRAM</label>
              <div className="text-sm text-gray-900">{planDetails.program}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">STATUS</label>
              <div className="text-sm text-red-600 font-medium">{planDetails.status}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CREATED AT</label>
              <div className="text-sm text-gray-900">{planDetails.createdAt}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PUBLISHED AT</label>
              <div className="text-sm text-gray-900">{planDetails.publishedAt}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PLAN OWNER ENABLED</label>
              <div className="text-sm text-gray-900">{planDetails.planOwner}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">MILESTONE NAME</label>
              <div className="text-sm text-gray-900">{planDetails.milestone}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PATH IN-PROGRESS OR COMPLETION</label>
              <div className="text-sm text-gray-900">{planDetails.pathInCompletion}</div>
            </div>
          </div>

          {/* Plan Health Checks */}
          <div className="mt-8">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Plan Health Checks</h3>
            <div className="space-y-2 text-sm">
              <div className="text-blue-600">PUB</div>
              <div className="text-blue-600">PUB</div>
              <div className="text-blue-600">PUB</div>
              <div className="text-blue-600">PUB</div>
              <div className="text-blue-600">PUB</div>
              <div className="text-blue-600">PUB</div>
              <div className="text-red-600">FAILED</div>
              <div className="text-blue-600">PUB</div>
              <div className="text-blue-600">PUB</div>
              <div className="text-red-600">FAILED</div>
            </div>
          </div>

          {/* Communication Settings */}
          <div className="mt-8">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Communication Settings</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-16 h-8 bg-gray-300 rounded text-xs flex items-center justify-center">GEN</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-8 bg-gray-300 rounded text-xs flex items-center justify-center">DEFAULT</div>
              </div>
            </div>
          </div>

          {/* Communication Rules */}
          <div className="mt-8">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Communication Rules</h3>
            <div className="text-sm text-gray-900">Auto-Generate Communication Rules</div>
          </div>
        </div>

        {/* Main Content - Milestone Table */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">NAME</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">POSITION</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">MILESTONE TYPE</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">DURATION IN DAYS</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">MEMBER DEFAULT STATUS</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">ACTIONABLE</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">UNLOCK AT</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">DUE AT</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">TIME OF DAY TO PING</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">DIRECT OUT OF STREAK</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700"># ACTIVITIES</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700"># ASSIGNMENTS</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700"># REQUIRED ACTIVITIES</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700"># QUOTES</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700"># REDIRECTS</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {milestones.map((milestone, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-blue-600 font-medium">{milestone.name}</td>
                      <td className="px-4 py-3">{milestone.position}</td>
                      <td className="px-4 py-3">{milestone.milestoneType}</td>
                      <td className="px-4 py-3">{milestone.duration}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          milestone.memberDefault === 'unlocked' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {milestone.memberDefault}
                        </span>
                      </td>
                      <td className="px-4 py-3">{milestone.actionable}</td>
                      <td className="px-4 py-3">{milestone.unlockAt}</td>
                      <td className="px-4 py-3">{milestone.dueAt}</td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3">{milestone.activities}</td>
                      <td className="px-4 py-3">{milestone.assignments}</td>
                      <td className="px-4 py-3">{milestone.members}</td>
                      <td className="px-4 py-3">{milestone.quotes}</td>
                      <td className="px-4 py-3">{milestone.redirects}</td>
                      <td className="px-4 py-3">
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">{milestone.actions}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Navigation */}
        <div className="w-64 bg-white border-l border-gray-200 p-6">
          {Object.entries(navigationSections).map(([section, items]) => (
            <div key={section} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{section}</h3>
              <ul className="space-y-1">
                {items.map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">About Plan</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>A defined course instance of Plan Templates is a guided journey that tracks a member's progression through a series of milestones.</p>
              <p className="font-medium">Key Stats:</p>
              <p>• Plan has been published</p>
              <p>• Course business type provisioned</p>
              <p>• Service business metrics participating</p>
              <p className="font-medium">Key Goals:</p>
              <p>• Member/learner</p>
              <p>• Milestone/performance/schedule structure</p>
              <p>• Real-time learning insights</p>
              <p>• Objective Learning goals</p>
              <p>• Course engagement control</p>
              <p className="font-medium">Manage:</p>
              <p>• Manage the milestones and execution of guided journey</p>
              <p className="font-medium">Key Stats:</p>
              <p>• Real-time/historical schedule</p>
              <p>• Real-time learning insights</p>
              <p>• Objective Learning goals</p>
              <p>• Course engagement control</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedJourney;