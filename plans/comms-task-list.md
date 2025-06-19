# Comms Feature Implementation Task List

This document breaks down the engineering tasks required to implement the new Communications Simulator feature as outlined in the PRD.

## Phase 1: Foundational Setup

-   [ ] **Task 1.1: Create New State Hooks for Rules**
    -   In `PlanMechanicsSimulator.js`, create a new `useState` hook to manage the communication rules configuration.
    -   The state should be an object that can hold the settings for all three new rule types (e.g., `{ planStatus: { enabled: true }, milestoneUnlocked: { enabled: false, days: 3, ... } }`).

-   [ ] **Task 1.2: Create New State for Scheduled Comms**
    -   In `PlanMechanicsSimulator.js`, create a `useState` hook for a "schedule" of pending communications.
    -   This will be an array of objects, where each object represents a future communication to be sent (e.g., `{ sendDate, milestoneId, ruleId }`). This is critical for the "X days after unlock" rule.

-   [ ] **Task 1.3: Create New `CommunicationsRules` Component**
    -   Create a new file: `src/components/CommunicationsRules/CommunicationsRules.js`.
    -   This component will contain the UI for configuring the communication rules.
    -   For now, create a basic scaffold for the component.

-   [ ] **Task 1.4: Refactor `PlanMechanicsSimulator.js` Layout**
    -   Modify the main component to include the new `CommunicationsRules` component.
    -   Repurpose the existing `CommunicationsSchedule` component to act as the "Triggered Communications Log".

## Phase 2: UI for Rule Configuration

-   [ ] **Task 2.1: Build UI for "Plan Status Change" Rule**
    -   In `CommunicationsRules.js`, add a checkbox to control the `enabled` flag for this rule.

-   [ ] **Task 2.2: Build UI for "Milestone Unlocked Follow-up" Rule**
    -   In `CommunicationsRules.js`, add a master `enabled` checkbox.
    -   Add a number input for "Days After Unlock".
    -   Add checkboxes for "Apply to Chapters", "Apply to Sessions".
    -   Add a checkbox for "Ignore optional milestones".
    -   Add a checkbox for "Only send for furthest unlocked milestone".

-   [ ] **Task 2.3: Build UI for "Session Reminder" Rule**
    -   In `CommunicationsRules.js`, add a master `enabled` checkbox.
    -   Add a number input for "Days Before Session".

-   [ ] **Task 2.4: Wire UI to State**
    -   Ensure all UI elements in `CommunicationsRules.js` correctly read from and write to the rules configuration state managed in `PlanMechanicsSimulator.js`.

## Phase 3: Core Logic Implementation

-   [ ] **Task 3.1: Create the Communications Engine in `useMilestoneCommunications`**
    -   Refactor the `useMilestoneCommunications.js` hook to be the central engine. It will need access to the rules configuration, the milestones, and the current date.
    -   Create a primary function, `evaluateAndTriggerCommunications`, that will be called from the main `useEffect` in `PlanMechanicsSimulator.js`.

-   [ ] **Task 3.2: Implement "Plan Status" Logic**
    -   Inside `evaluateAndTriggerCommunications`, add logic to check if the plan has just started or just been completed.
    -   If the rule is enabled, add a new entry to the communications log.

-   [ ] **Task 3.3: Implement "Milestone Unlocked" Scheduling**
    -   Modify `handleMilestoneStateChange`. When a milestone's `newState` is `unlocked`, it should check the "Milestone Unlocked" rule.
    -   If the rule applies (considering type, optionality etc.), add a new entry to the "pending communications" schedule array.

-   [ ] **Task 3.4: Implement "Furthest Unlocked" Logic**
    -   When scheduling a new "Milestone Unlocked" comm, first find all currently unlocked milestones.
    -   Identify the one with the highest `position`.
    -   Remove any other pending "Milestone Unlocked" comms from the schedule that are not for the furthest milestone.

-   [ ] **Task 3.5: Implement "Session Reminder" Logic**
    -   Inside `evaluateAndTriggerCommunications`, iterate through all `session` milestones.
    -   Check if `milestone.startDate - rule.days === currentDate`.
    -   If it matches and the rule is enabled, add a new entry to the communications log.

-   [ ] **Task 3.6: Implement Pending Comms Triggering**
    -   Inside `evaluateAndTriggerCommunications`, check the pending communications schedule.
    -   If any scheduled comm has a `sendDate` that matches the `currentDate`, move it from the pending schedule to the final communications log.

## Phase 4: Integration and Finalization

-   [ ] **Task 4.1: Integrate Engine with Simulator**
    -   In `PlanMechanicsSimulator.js`, ensure the `evaluateAndTriggerCommunications` function is called from the main `useEffect` that watches `currentDate`.

-   [ ] **Task 4.2: Refactor `CommunicationsSchedule.js`**
    -   Update the log component to display the richer data for each communication (rule, trigger, etc.).

-   [ ] **Task 4.3: Testing**
    -   Manually test all rule configurations and edge cases.
    -   Verify that advancing the date correctly triggers scheduled and reminder communications.
    -   Verify the "furthest unlocked" logic works as expected when multiple milestones unlock at once. 