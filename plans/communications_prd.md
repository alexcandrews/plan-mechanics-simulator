# Communications Simulator Product Requirements Document (PRD)

## 1. Introduction

### 1.1 Purpose
This document outlines the requirements for a significant enhancement to the Communications (Comms) feature within the Plan Mechanics Simulator. The goal is to create a higher-fidelity simulation that more accurately models the automated communication capabilities of the production "Guided Journey" system.

### 1.2. Scope
This enhancement will introduce a user-configurable rules engine for defining communication triggers and a dynamic log that displays when these communications are "sent" based on the user's progression through a simulated plan.

---

## 2. Core Features

### 2.1. Communication Rule Configuration
A new UI section will be created allowing users to define and configure a set of communication rules. This provides the core input for the simulation.

### 2.2. Triggered Communications Log
The existing "Communications Schedule" panel will be repurposed into a dynamic log. It will display a chronological list of communications as they are triggered by the simulator's logic, providing immediate feedback on how the configured rules interact with the plan's state.

---

## 3. Communication Rule Definitions

The following communication rules will be implemented. These are prioritized as P0.

### 3.1. Plan Status Change Emails
-   **Description:** Sends a communication when the entire plan begins or is completed.
-   **Trigger:**
    -   Plan `startDate` is reached.
    -   All *required* milestones in the plan achieve a `completed` state.
-   **User Configuration:** A single toggle to enable/disable "Plan Status Comms."

### 3.2. Milestone Unlocked Follow-up Email
-   **Description:** Sends a follow-up or nudge email a set number of days *after* a milestone becomes unlocked. This is a delayed trigger.
-   **Trigger:** `X` days after a milestone's `state` changes to `unlocked`.
-   **User Configuration:**
    -   **Days After Unlock:** A number input for `X`.
    -   **Milestone Type:** Checkboxes to select whether this rule applies to `chapter` and/or `session` type milestones.
    -   **Ignore Optional:** A checkbox to prevent this communication from being sent for any milestone marked as `optional`.
    -   **Furthest Milestone Only:** A checkbox to ensure that if multiple milestones are unlocked simultaneously, this communication is only sent for the one with the highest `position` (i.e., the furthest along in the plan).

### 3.3. Session Reminder Email
-   **Description:** Sends a reminder email a set number of days *before* a scheduled session.
-   **Trigger:** `X` days before a `session` type milestone's `startDate`.
-   **User Configuration:**
    -   **Days Before Session:** A number input for `X`.

---

## 4. Triggered Communications Log UI

The log will display the following information for each triggered communication:
-   **Timestamp:** The simulated date (`currentDate`) on which the communication was sent.
-   **Communication Rule:** A human-readable name for the rule that was triggered (e.g., "Milestone Unlocked Follow-up").
-   **Details / Triggering Event:** Context about what caused the trigger (e.g., "Milestone 2: 'Core Concepts' unlocked", "Plan Completed").

---

## 5. Future Considerations (Out of Scope for P0)

The following concepts were mentioned in the initial request but will be considered for future iterations to keep the initial implementation manageable.

-   **"Unlocked By" Condition:** Logic to ignore "Milestone Unlocked" comms if the unlock was triggered by an administrative action vs. natural progression.
-   **"Session Completed" Condition:** A complex rule where a "Milestone Unlocked" communication for a session milestone is delayed until after the session itself is marked `completed`.
-   **Email Content Simulation:** The current scope is limited to logging the trigger event, not simulating the content of the emails themselves. 