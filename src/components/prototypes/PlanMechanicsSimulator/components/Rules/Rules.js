import React from 'react';

const Rules = () => {
  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-2">Plan Milestone Rules Applied:</h3>
      {/* <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1 text-left">
        <li>First milestone is always unlocked if not completed</li>
        <li>A milestone becomes unlocked when the last non-optional milestone preceding it is completed</li>
        <li>Optional milestones can be skipped without blocking progression</li>
        <li>A milestone becomes locked if its preceding required milestone is no longer completed</li>
        <li>Milestone states can only progress forward: locked → unlocked → completed (no backward movement)</li>
      </ul> */}
      <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1 text-left">
        <li><strong>States and Progression</strong>
          <ul>
            <li>States can only progress forward, never backward</li>
            <li>Milestones can skip states (e.g., go directly from locked to completed)</li>
          </ul>
        </li>
        <li><strong>First Milestone Rule</strong>
          <ul>
            <li>The first milestone is always unlocked if not completed</li>
          </ul>
        </li>
        <li><strong>Optional Milestone Rules</strong>
          <ul>
            <li>Optional milestones don't block progression to subsequent milestones</li>
          </ul>
        </li>
        <li><strong>Communications</strong>
          <ul>
            <li>Communications are triggered at specific events:
              <ul>
                <li>When the plan begins</li>
                <li>When a milestone is unlocked</li>
                <li>3 days after a milestone is unlocked</li>
                <li>7 days after a milestone is unlocked</li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default Rules; 