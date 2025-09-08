// Mock data for AdminPanel prototype - exact match to screenshot
export const mockPlanData = {
  basic: {
    guid: "ABC123abc-1234-abcd-12-abcd12345678",
    businessName: "AI Flight School",
    planName: "AI Flight School Cohort 11 & 12",
    description: "AI Flight School",
    status: "active",
    published: true
  },
  dates: {
    startDate: "Jun 3, 2025 at 04:00 AM PDT",
    endDate: "Jun 3, 2025 at 04:00 PM PDT"
  },
  settings: {
    dueDatesEnabled: true,
    milestoneUnlockingStrategy: "By completion when all required preceding milestones are completed",
    autoCalculate: true,
    planLength: "365 days"
  },
  healthChecks: [
    {
      id: 1,
      condition: "Announced milestones must include at least one required activity",
      priority: "P1", 
      enabled: true,
      description: "Plans will be required for milestone completion activity to be milestone activity."
    },
    {
      id: 2,
      condition: "Any session milestone must be listed in a group coaching event",
      priority: "P2",
      enabled: true, 
      description: "Plans will be control for Digest or session content milestones."
    },
    {
      id: 3,
      condition: "Plan completion certificate settings",
      priority: "P1",
      enabled: false,
      description: "Plans with a completion certificate must choose template and a 'completion certificate' activity at the end of the plan. This plan generates completion certificates, but member won't be able to download it. Create a 'completion certificate' activity at the end of the plan."
    },
    {
      id: 4,
      condition: "Performance tracking must be registered to track series",
      priority: "P2",
      enabled: true,
      description: "Plans will set performance registrations to track series."
    },
    {
      id: 5,
      condition: "Referral coaching must use a date, not just Notification information",
      priority: "P2",
      enabled: true,
      description: "Plans need to update the series to have feature, type = date_to_start_facilitation."
    },
    {
      id: 6,
      condition: "Social coaching event must use a date",
      priority: "P2", 
      enabled: true,
      description: "Plans will If currently published, then refresh. Contact CSA support if it renders stuck."
    },
    {
      id: 7,
      condition: "All members must have at least one non-locked milestone",
      priority: "P2",
      enabled: true,
      description: "Plans unlock or add a non-locked milestone for every member."
    },
    {
      id: 8,
      condition: "All members must have a Milestone/Milestone activity for each milestones",
      priority: "P2",
      enabled: true,
      description: "Plans will If currently published, then refresh. Contact CSA support if it renders stuck."
    },
    {
      id: 9,
      condition: "All members must have a Milestone/Milestone for every milestone",
      priority: "P2",
      enabled: true,
      description: "Plans will If currently published, then refresh. Contact CSA support if it renders stuck."
    }
  ]
};

export const mockMilestones = [
  {
    id: 1,
    name: "Intro & Resources",
    position: 1,
    milestoneType: "chapter",
    duration: 0,
    memberDefaultStatus: "unlocked",
    optional: false,
    unlockAt: "Jun 3, 2025 at 04:00 AM PDT",
    dueAt: "Jun 3, 2025 at 04:00 AM PDT",
    activities: 1,
    assessments: 1,
    resources: 1,
    quotes: 1,
    reflections: 1
  },
  {
    id: 2,
    name: "Prep for Session 1",
    position: 2,
    milestoneType: "session",
    duration: 0,
    memberDefaultStatus: "unlocked",
    optional: false,
    unlockAt: "Jun 3, 2025 at 04:00 AM PDT",
    dueAt: "Jun 6, 2025 at 04:00 AM PDT",
    activities: 1,
    assessments: 1,
    resources: 0,
    quotes: 0,
    reflections: 0
  },
  {
    id: 3,
    name: "Live Session 1",
    position: 3,
    milestoneType: "session",
    duration: 0,
    memberDefaultStatus: "locked",
    optional: false,
    unlockAt: "Jun 6, 2025 at 04:00 AM PDT",
    dueAt: "Jun 10, 2025 at 04:00 AM PDT",
    activities: 1,
    assessments: 1,
    resources: 0,
    quotes: 0,
    reflections: 0
  },
  {
    id: 4,
    name: "Live Session 2",
    position: 4,
    milestoneType: "session",
    duration: 0,
    memberDefaultStatus: "locked",
    optional: false,
    unlockAt: "Jun 10, 2025 at 04:00 AM PDT",
    dueAt: "Jun 14, 2025 at 04:00 AM PDT",
    activities: 1,
    assessments: 1,
    resources: 0,
    quotes: 0,
    reflections: 0
  },
  {
    id: 5,
    name: "Prep for Session 3",
    position: 5,
    milestoneType: "session",
    duration: 0,
    memberDefaultStatus: "locked",
    optional: false,
    unlockAt: "Jun 14, 2025 at 04:00 AM PDT",
    dueAt: "Jun 18, 2025 at 04:00 AM PDT",
    activities: 1,
    assessments: 1,
    resources: 0,
    quotes: 0,
    reflections: 0
  },
  {
    id: 6,
    name: "Live Session 3",
    position: 6,
    milestoneType: "session",
    duration: 0,
    memberDefaultStatus: "locked",
    optional: false,
    unlockAt: "Jun 18, 2025 at 04:00 AM PDT",
    dueAt: "Jun 22, 2025 at 04:00 AM PDT",
    activities: 1,
    assessments: 1,
    resources: 0,
    quotes: 0,
    reflections: 0
  },
  {
    id: 7,
    name: "Prep for Session 4",
    position: 7,
    milestoneType: "session",
    duration: 0,
    memberDefaultStatus: "locked",
    optional: false,
    unlockAt: "Jun 22, 2025 at 04:00 AM PDT",
    dueAt: "Jun 26, 2025 at 04:00 AM PDT",
    activities: 1,
    assessments: 1,
    resources: 0,
    quotes: 0,
    reflections: 0
  },
  {
    id: 8,
    name: "Live Session 4",
    position: 8,
    milestoneType: "session",
    duration: 0,
    memberDefaultStatus: "locked",
    optional: false,
    unlockAt: "Jun 26, 2025 at 04:00 AM PDT",
    dueAt: "Jun 30, 2025 at 04:00 AM PDT",
    activities: 1,
    assessments: 1,
    resources: 0,
    quotes: 0,
    reflections: 0
  },
  {
    id: 9,
    name: "Live Session 5",
    position: 9,
    milestoneType: "session",
    duration: 0,
    memberDefaultStatus: "locked",
    optional: false,
    unlockAt: "Jun 30, 2025 at 04:00 AM PDT",
    dueAt: "Jul 4, 2025 at 04:00 AM PDT",
    activities: 1,
    assessments: 1,
    resources: 0,
    quotes: 0,
    reflections: 0
  },
  {
    id: 10,
    name: "Live Session 6",
    position: 10,
    milestoneType: "session",
    duration: 0,
    memberDefaultStatus: "locked",
    optional: false,
    unlockAt: "Jul 4, 2025 at 04:00 AM PDT",
    dueAt: "Jul 8, 2025 at 04:00 AM PDT",
    activities: 1,
    assessments: 1,
    resources: 0,
    quotes: 0,
    reflections: 0
  },
  {
    id: 11,
    name: "Flying Solo Conclusions",
    position: 11,
    milestoneType: "chapter",
    duration: 0,
    memberDefaultStatus: "locked",
    optional: false,
    unlockAt: "Jul 8, 2025 at 04:00 AM PDT",
    dueAt: "Jul 12, 2025 at 04:00 AM PDT",
    activities: 1,
    assessments: 1,
    resources: 0,
    quotes: 0,
    reflections: 0
  }
];

export const mockNavigationSections = [
  {
    title: "Templating Engine",
    items: ["Plan Template"]
  },
  {
    title: "Deployment Engine", 
    items: ["Plan Template", "Communications Plan"]
  },
  {
    title: "Actions",
    items: ["View Build", "Outline Plan", "Create Plan Structure", "Create Summary Plan View"]
  },
  {
    title: "Certificates",
    items: ["Create Completion Certificate", "Create Understanding Certificate for Members", "Tie: You can add the 'Completion Certificate for Members' to a downloadable PDF activity to the"]
  },
  {
    title: "About Plan",
    items: ["A definite outline instance of 'Plan Mechanics in action' will include being a 6-week guided"]
  },
  {
    title: "Key Status",
    items: ["Learning Facility Performance Dashboard", "Course Members Activity Performance"]
  },
  {
    title: "Integrations",
    items: ["Messaging and coordination of group dynamics", "Course Planning Engine", "Objective Learning goals", "Online assignment content"]
  }
];