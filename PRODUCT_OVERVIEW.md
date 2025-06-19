<!--
AI INSTRUCTIONS — Read and Follow all the AI Instructions in the sibling README.md before updating this file.
-->

## 1. Introduction

### 1.1. Purpose of the Guided Journey System
The Guided Journey system provides a structured learning pathway for members, comprising sequential milestones such as chapters and sessions. It aims to guide members through content in a logical order, manage their progression, and provide administrative tools to oversee and intervene in member journeys when necessary.

### 1.2. Purpose of This Document
This document serves as the definitive functional guide to the Guided Journey system. It synthesizes information from previous analyses and code verifications to provide a comprehensive understanding of its current implementation, capabilities, and limitations, tailored for Product Managers, Quality Assurance teams, and Curriculum Designers.

### 1.3. Target Audience
This guide is intended primarily for:
*   **Product Managers:** To understand system capabilities, user impact, and inform product strategy.
*   **Quality Assurance:** To formulate test plans based on verified system behavior, configurations, and edge cases.
*   **Curriculum Designers & Administrators:** To understand how to structure plans and utilize admin tools effectively based on current system logic.

---

## 2. Core Concepts & System Functionality

### 2.1. Plan Structure
*   **Plan Template:** A reusable blueprint for designing the overall journey, from which specific `Plans` are created.
*   **Plan:** The actual, live instance of a journey, typically cloned from a `Plan Template`. It is a learning pathway composed of an ordered sequence of `Milestones`. Plans can also be created directly without using a template, which is useful for testing and iterative development before standardizing the journey structure.
*   **Milestone Template:** A reusable blueprint for each stage, chapter, or group session within a `Plan Template`.
*   **Milestones:** Individual units of learning or engagement within a `Plan`, derived from `Milestone Templates`. They have several key attributes that drive system behavior:
    *   `id`: A unique system identifier.
    *   `name`: The display name visible to users and administrators.
    *   `position`: An integer defining its order within the plan, critical for sequential progression.
    *   `milestone_type`: Defines the nature of the milestone. Key types include:
        *   **Chapter:** Typically a learning module with content and often an assessment required for completion.
        *   **Session:** An event (live or recorded). Completion is usually determined by a post-session assessment.
    *   `optional` (boolean): If `true`, this milestone is treated as supplementary content. Members can progress through the plan and complete it without finishing optional milestones, though these milestones remain available for engagement if desired. Administrators can configure this setting.
    *   `unlock_at` (datetime): A specific date and time that can be set on a milestone. This date is used by the system, in conjunction with the Plan's selected `milestone_unlocking_strategy`, to determine if a milestone can become available to a member based on time. This is distinct from any calculated "due dates" which are primarily for member pacing and display.
    *   `member_default_status` (string): The initial status a milestone will have for a new member (e.g., 'locked', 'unlocked') before any specific progression logic or overrides are applied. This is explained in more detail in section 2.2.
    *   **Activities:** Specific tasks or resources for members to complete within a `Milestone`. These are derived from `Activity Templates`.
        *   **Types:** Include watching a video, reading a PDF, completing a standard assessment, engaging with a new **"Ink" interactive activity type**, or interacting with a workbook.
        *   **Duration:** Activities now display an estimated duration (e.g., "30 min") to help members plan their time. This is configurable by administrators.
        *   The `title` of an activity's `associated_record` (e.g., the title of a Resource linked to a video or PDF activity) is now available and can be displayed in the UI, providing more context to the member.
    *   **Objectives:** Learning goals or expected outcomes associated with a `Milestone`, derived from `Objective Templates`.
    *   **Quotes:** Inspirational messages that can be included within a `Milestone` to enhance engagement, derived from `Quote Templates`. The content of these quotes now supports Markdown formatting.
    *   **Resource Lists:** Collections of useful files, links, or other resources that can be attached to a milestone for member access, displayed at the end of the milestone page.

*   **Plan Attributes (configurable by Admins):**
    *   `communications_enabled` (boolean): When enabled, allows the system to send automated communications (e.g., reminders, notifications) to members based on `PlanCommunicationRule`s. Default is `false`.
    *   `courier_brand_key` (string): Specifies a brand configuration for Courier (our communication delivery service), allowing customized appearances for emails and other notifications related to this plan.
    *   `completion_certificate_template` (string): Allows selection of a specific certificate design upon plan completion. Options include `generic` and `dare_to_lead`. Setting this to `dare_to_lead` also enables the "Plan Completion Celebration Overlay" feature (see Section 7.7).
    *   `celebration_overlay_enabled` (boolean, system-derived): This flag is effectively true if `completion_certificate_template` is `'dare_to_lead'`, enabling a special completion overlay. It is not directly set by admins but is a consequence of the chosen certificate template.

*   **Activity Template:** A reusable blueprint for tasks within a `Milestone Template`. Can now include a default `duration`.
*   **Objective Template:** A reusable blueprint for learning goals within a `Milestone Template`.
*   **Quote Template:** A reusable blueprint for inspirational content within a `Milestone Template`.

### 2.2. Milestone States (Per Member)
Each milestone, for a specific member, exists in one of the following states, tracked by the system:
*   **Locked:** The milestone is not yet accessible to the member. They cannot view its content or complete its associated actions. This is the default state for milestones that have unmet prerequisites or `unlock_at` conditions.
*   **Unlocked:** The milestone is available for the member to engage with. Its content can be viewed, and actions can be taken, but it has not yet been formally completed.
*   **Completed:** The milestone has been successfully finished by the member. This can occur through member actions (e.g., submitting required assessments) or via an administrative override. Completion typically triggers checks to unlock subsequent milestones.

### 2.3. Key System Components and Their Functional Roles
The Guided Journey system functions through the interaction of several key areas, enabling the design, deployment, and tracking of member experiences:

*   **Frontend User Interface & Navigation Logic:**
    *   **Redirection Engine:** A core piece of frontend logic is responsible for automatically determining the most relevant milestone to display when a member visits their plan page. It uses a defined priority list (see Section 3.1) based on milestone status, type (required/optional), and order.
    *   **Milestone Validity Check:** Before displaying a milestone page, a frontend check ensures that the targeted milestone is not currently in a `locked` state for the member. This prevents users from directly landing on inaccessible content via the primary redirection flow.
    *   **Milestone Display Components:** Frontend components are responsible for rendering individual milestones in lists or headers, visually indicating their status (e.g., locked, completed, current) and providing the necessary navigation links or actions.
        *   Activities such as `Video` and the new `Ink` (Interactive Assessment) activity type now open in a **modal dialog** for a more focused user experience.
        *   In the UI, `started` `Ink` activities and `Assessment` activities have a distinct visual style and do not automatically appear with a "completed" style like other `started` activities (e.g., `video`, `pdf`). This distinction helps users understand that further action or system processing is typically required for these types to be marked fully `completed`.
    *   **Today Item Integration:** Active Guided Journey plans (currently focused on "Dare to Lead" plans for eligible users) may also be highlighted to members through "Today Item" cards on their main dashboard or home page. These cards display a title (customized for DTL), description, and an image (e.g., `plan_dare_to_lead.jpg` for DTL), with a direct link to their ongoing journey. This integration aims to increase visibility and ease of access.
    *   **Plan Completion Celebration Overlay:** A dedicated overlay can be displayed upon plan completion, currently for plans using the "Dare to Lead" certificate template. This feature is detailed in Section 7.7.

*   **Backend Progression & State Management Services:**
    *   **Milestone Unlocking Service:** This is the central backend service that manages when a locked milestone should become unlocked for a member. It's triggered when a member completes a preceding milestone or when background processes evaluate time-based conditions. This service now consults the `milestone_unlocking_strategy` set on the `Plan` to determine the precise conditions under which a milestone unlocks (see Section 3.2 for details) and correctly handles navigation around optional milestones.
    *   **Milestone Completion Service:** This backend service handles the process of marking a milestone as `completed` for a member. This is a critical action, as it also initiates the process to check if any subsequent milestones should now be unlocked (via the Milestone Unlocking Service). It considers only required activities for determining milestone completion.
    *   **Administrative Action Service:** A dedicated backend service allows administrators to manually change a member's status on a specific milestone (e.g., force-unlock or force-complete). This service also ensures that downstream effects, like unlocking subsequent content, are processed.
    *   **Data Models:** The backend relies on data models to store information about plans, the structure and attributes of milestones (including `position`, `optional`, `unlock_at`, and `duration_in_days` for the milestone itself), and the specific status of each milestone for every enrolled member. Activities within milestones also store their own `duration` (in minutes). The system also tracks when a member's overall plan enrollment status (`PlanMember.status`) last changed, storing this timestamp in `PlanMember.status_updated_at` to accurately reflect the last status transition time.

*   **Administrative Interface:**
    *   A dedicated interface for administrators provides tools to create and manage `Plan Templates`, `Plans` (by cloning templates), define and sequence `Milestones` (and their constituent `Activities`, `Objectives`, `Quotes`), set attributes (like `optional` for milestones, `unlock_at`, `duration_in_days` for milestones, and `duration` for activities/activity templates), manage member enrollment, publish `Plans`, and perform member-specific overrides.
    *   A new **Milestone Statistics Page** is available, offering administrators detailed insights into member progress and activity completion rates for each milestone, including status counts for member milestones (locked, unlocked, completed) and completion rates for each activity within those milestones. This helps in monitoring engagement and identifying potential areas where members might need support.

### 2.4. System Architecture – Functional Overview
The Guided Journey system is underpinned by three core conceptual engines that work together:

*   **Templating Engine:**
    *   **Purpose:** Provides the reusable blueprints for efficiently building and standardizing journeys.
    *   **Key Components (Templates):** `Plan Template`, `Milestone Template`, `Activity Template`, `Objective Template`, and `Quote Template`.
    *   **Functionality:** Allows administrators to define the structure, content elements, and default settings for various parts of a learning journey without creating a live plan.

*   **Deployment Engine:**
    *   **Purpose:** Manages the instantiation (cloning) of template-based journeys into actual, live `Plans` that members can be enrolled in.
    *   **Key Components (Live Instances):** `Plan`, `Milestone`, `Activity`, `Objective`, and `Quote`.
    *   **Functionality:** Takes the blueprints from the Templating Engine and creates concrete versions that can be customized, assigned start dates, have members enrolled, and published for access.

*   **Member Engine:**
    *   **Purpose:** Tracks and reports on individual members' enrollment and progress throughout a live `Plan`.
    *   **Key Components:** `Plan Member` (represents a member's enrollment in a plan), `Member Milestone` (tracks progress through each milestone), and `Member Activity` (tracks interaction with each activity).
    *   **Functionality:** Provides the data necessary for monitoring completion, identifying sticking points, and understanding how members are interacting with the journey.

By leveraging these engines, administrators can efficiently create, deploy, and manage guided learning or development experiences for members at scale.

---

## 3. The Member's Journey: Progression & Navigation Logic

This section details how members are guided through a plan and how content becomes accessible to them based on system configurations.

### 3.1. Auto-Redirection Logic

When a member navigates to a plan page, the system automatically attempts to redirect them to the most relevant milestone. This is handled by a **frontend redirection engine**.

**Redirection Priority (Order of Evaluation):**

1.  **First Unlocked Required Milestone:** The system first searches for the earliest milestone in the plan's sequence that is **required** (i.e., its `optional` attribute is `false`) and is currently `unlocked` but not yet `completed` for the member.
    *   *QA Focus:* Verify that if multiple required milestones are unlocked, the one with the lowest `position` number is targeted.
2.  **First Unlocked Optional Milestone:** If no required milestones meet the above criteria (e.g., all currently accessible required steps are completed, and the next required steps are still locked), the system then looks for the earliest **optional** milestone (its `optional` attribute is `true`) that is `unlocked` but not yet `completed`.
    *   *QA Focus:* Test scenarios where required milestones are complete or locked, but optional ones are available.
3.  **Last Completed Milestone:** If no milestones are currently `unlocked` for the member (e.g., they are waiting for future content to become available via an `unlock_at` date), the system redirects the member to the **last milestone they `completed`** in the plan.
    *   *QA Focus:* Verify this provides a sensible return point when active progression is paused.
4.  **First Milestone in Plan (Fallback):** As a final fallback (most likely for a new enrollment where the initial unlock process hasn't yet completed), the system targets the very first milestone (the one with `position: 1`) in the plan's sequence.
    *   *QA Focus:* Test behavior immediately after enrollment if backend processing might be slightly delayed.

**Preventing Direct Navigation to Locked Milestones (Frontend Validity Check):**

*   When the system initially attempts to navigate to a specific milestone (either through direct linking, a user action, or an initial selection by the redirection engine), a **frontend validity check** is performed. This check ensures the targeted milestone is **not** `locked` for the member.
*   If this validity check finds the initially targeted milestone is `locked`:
    *   The direct attempt to navigate to that specific locked milestone is prevented.
    *   The system then **initiates (or re-initiates) the full auto-redirection process** described in "Redirection Priority (Order of Evaluation)" above (Section 3.1). This means it will systematically search for the first available milestone according to that priority list (First Unlocked Required, then First Unlocked Optional, etc.).
*   **Product Implication / UX Requirement:** This two-step approach (initial target validation, followed by full redirection logic if needed) is designed to prevent the user from landing directly on a page for a locked milestone.
    *   If, after the full auto-redirection process completes, the *only* milestone that can be identified as the target (e.g., the fallback to the "First Milestone in Plan") is *still* in a `locked` state for the member (for instance, due to processing delays for a new enrollment), the User Interface (UI) **is intended to gracefully handle** this scenario. Ideally, this would involve displaying a context-specific message (e.g., "Content not yet available," a general plan overview) rather than a generic error page or allowing a redirect loop.
    *   *QA Focus:* Test initial plan load for new users extensively to ensure no redirect loops or error pages occur if the first milestone is momentarily locked. Verify the defined "graceful handling" UI.

**User Experience for Boundary Conditions:**

*   **All Milestones Locked:** As described above, the system will attempt to redirect. If the ultimate target remains a locked milestone (after fallbacks), the UI must provide a clear "overview" or "waiting for content" state.
*   **All Milestones Completed:** When the overall `plan.status` is `completed`, the redirection logic is as follows: The system first checks the status of the very last milestone in the plan. If this last milestone is not yet `completed` (which would be an unusual state if the plan itself is marked completed), the member is directed to this last milestone. Otherwise (if the last milestone is also `completed`, signifying the entire plan is truly finished), the member is redirected to the *first milestone* of the plan (i.e., `plan.milestones[0].id`), allowing for a review from the beginning. Additionally, a "Plan Completion Overlay" may be displayed (see Section 7.7).

### 3.2. Milestone Unlocking Mechanisms

Milestones transition from `locked` to `unlocked` for a member based on their actions and/or predefined milestone configurations. This is primarily managed by a **backend milestone unlocking service**. This service uses the specific `unlock_at` date/time set on a milestone (if any) for time-based release, and it interprets the role of this date strictly according to the **plan-level `milestone_unlocking_strategy`**. Calculated "due dates" (derived from `duration_in_days`) are for member pacing and do not govern this automated unlocking logic.

**Core Unlocking Factors:**
Regardless of the strategy, two main factors are considered:

1.  **Prerequisite Completion Check:** Are all **preceding `required`** (non-optional) milestones in the plan's defined sequence marked as `completed` for the member? (Optional milestones are ignored when checking prerequisites for subsequent required milestones).
2.  **Time-Based Release Check:** Does the milestone have an `unlock_at` datetime attribute configured, and has that specified date and time now passed?

**Plan-Level Unlocking Strategies (Now Functional):**
Administrators can now define a specific `milestone_unlocking_strategy` for each `Plan` (and `Plan Template`). This strategy dictates how the Prerequisite Completion Check and Time-Based Release Check interact to unlock milestones:

1.  **Strategy: `by_completion_only` (Completion-Based)**
    *   A milestone unlocks **only when all preceding required milestones are completed**.
    *   Any `unlock_at` date set on a milestone is effectively ignored.
    *   *QA Focus:* Verify milestones only unlock after prerequisites are met, regardless of any `unlock_at` dates.

2.  **Strategy: `by_unlock_at_or_completion` (Time-Based OR Completion-Based)**
    *   A milestone unlocks if **EITHER all preceding required milestones are completed OR its `unlock_at` date/time has passed**.
    *   If a milestone has no `unlock_at` date, it behaves like `by_completion_only`.
    *   If an `unlock_at` date is set, it can unlock either by that date passing or by prerequisites being met, whichever happens first.
    *   *(This was the system's previous default behavior when `unlock_at` was present).*
    *   *QA Focus:* Test that milestones unlock if prerequisites are met OR `unlock_at` has passed. Test with and without `unlock_at` dates.

3.  **Strategy: `by_unlock_at_and_completion` (Time-Based AND Completion-Based)**
    *   A milestone unlocks **only when BOTH all preceding required milestones are completed AND its `unlock_at` date/time has passed**.
    *   If a milestone has no `unlock_at` date set, the time-based condition cannot be met, effectively meaning it will rely on prerequisite completion (behaving like `by_completion_only` in this specific sub-case, assuming `unlock_at` being nil means the "time" condition is considered met for the purpose of not blocking indefinitely if no time is specified. *Behavior for nil `unlock_at` needs spec verification here*). If the strategy strictly requires an `unlock_at` for the time component, a nil `unlock_at` would mean the milestone never unlocks via this strategy path if prerequisites are met but no date is set. For testing, assume if `unlock_at` is not set, it cannot satisfy the "AND `unlock_at`" part unless explicitly stated otherwise by system behavior for nil `unlock_at`.
    *   *QA Focus:* Verify milestones only unlock when prerequisites are met AND `unlock_at` has passed. Thoroughly test the case where `unlock_at` is not set on a milestone.

4.  **Strategy: `by_unlock_at_only` (Time-Based Only)**
    *   A milestone unlocks **only when its `unlock_at` date/time has passed**.
    *   The completion status of preceding required milestones is ignored for unlocking purposes.
    *   If a milestone has no `unlock_at` date set, it will **not** unlock via this strategy (as there is no time condition to meet).
    *   *QA Focus:* Verify milestones unlock only when `unlock_at` has passed, regardless of prerequisite completion. Confirm milestones without an `unlock_at` date do not unlock under this strategy.

**Interaction of Unlocking Conditions (Summary):**
The selected `milestone_unlocking_strategy` on the Plan now governs the unlocking logic. The backend milestone unlocking service consults this strategy to determine if a milestone should transition from `locked` to `unlocked`.

*QA Focus for Unlocking (General):*
*   Test each of the four `milestone_unlocking_strategy` settings extensively.
*   For each strategy, test scenarios with:
    *   Milestones having no `unlock_at` date.
    *   Milestones with a future `unlock_at` date.
    *   Milestones with a past `unlock_at` date.
*   Ensure prerequisites are correctly evaluated (ignoring optional milestones).
*   Verify behavior when `unlock_at` is nil for strategies involving time (`by_unlock_at_and_completion`, `by_unlock_at_only`).

**The "Plan-Level Unlocking Strategies" – Now Implemented:**

*   **Previous Status:** Formerly, system designs referred to these four strategies, but the admin UI was non-functional, and the backend consistently used an "OR" logic (`by_unlock_at_or_completion`) if an `unlock_at` date was present on a milestone.
*   **Current Operational Reality:**
    1.  **Admin UI for Plan-Level Strategy is Active:** The administrator interface (for both `Plan Templates` and live `Plans`) now allows selection of one of the four `milestone_unlocking_strategy` options.
    2.  **Backend Service Logic:** The core **backend milestone unlocking service** now actively uses and consults the selected plan-level `milestone_unlocking_strategy` to determine how and when milestones unlock.
*   **Consequences & Product/QA Implications:**
    *   **Operational Summary:** The system's unlocking behavior is now dictated by the explicit `milestone_unlocking_strategy` chosen for the Plan. Administrators have enhanced control over content release cadence and dependencies.
    *   **Impact on `unlock_at`:** The significance and behavior of an `unlock_at` date on a milestone are now interpreted through the lens of the chosen plan-level strategy. For example, under `by_completion_only`, an `unlock_at` date is ignored. Under `by_unlock_at_only`, it's the sole factor.
    *   **Implemented Strategies:** All four strategies (`by_completion_only`, `by_unlock_at_or_completion`, `by_unlock_at_and_completion`, `by_unlock_at_only`) are now available for use.
    *   **Configuration Note:** The chosen `milestone_unlocking_strategy` can be set or changed before a plan starts. However, once a plan has started (i.e., its `starts_at` date is in the past and it has been `published`), this strategy cannot be changed.
    *   **Product Roadmaps & Documentation:** All user guides, admin training, and product planning **must accurately reflect this new, flexible behavior.**
    *   **QA Testing:** Tests must now cover all four unlocking strategies and their interactions with milestone `unlock_at` dates and prerequisite completion statuses. Pay special attention to edge cases like `nil unlock_at` dates within each strategy.
    *   The implementation of these selectable strategies represents a significant enhancement to the platform's flexibility.

### 3.3. Role and Behavior of Optional Milestones

*   **Definition:** Milestones with their `optional` attribute set to `true` are treated as supplementary or bonus content. Administrators can configure this setting when creating or editing milestones.
*   **Impact on Progression:** They **do not block** a member's progress to subsequent `required` milestones. The backend logic for checking prerequisite completion (as part of the selected `milestone_unlocking_strategy`) explicitly excludes optional milestones.
*   **Unlocking Optional Content:**
    *   Optional milestones unlock based on the same plan-level `milestone_unlocking_strategy` as required milestones (e.g., `by_completion_only`, `by_unlock_at_or_completion`, etc.).
    *   A member might see an optional milestone become available because its `unlock_at` date has passed or because they have completed the preceding required milestones (depending on the strategy).
*   **Completing Optional Milestones:**
    *   Members can choose to engage with and complete optional milestones. Doing so follows the same completion rules as required milestones (e.g., finishing all its required activities).
*   **Skipping Optional Milestones:**
    *   Members are not required to complete optional milestones to finish the overall plan or to unlock subsequent required milestones. The system will allow them to progress past an optional milestone if they have met the criteria for the *next required* milestone. The redirection logic (Section 3.1) will also prioritize focusing on unlocked required milestones over unlocked optional ones if both exist.
*   **Impact on Plan Completion:** The completion of optional milestones does not affect the overall plan completion status, which is determined by the completion of all *required* milestones.

*QA Focus:*
*   Test each of the four `milestone_unlocking_strategy` settings extensively.
*   For each strategy, test scenarios with:
    *   Milestones having no `unlock_at` date.
    *   Milestones with a future `unlock_at` date.
    *   Milestones with a past `unlock_at` date.
*   Ensure prerequisites are correctly evaluated (ignoring optional milestones).
*   Verify behavior when `unlock_at` is nil for strategies involving time (`by_unlock_at_and_completion`, `by_unlock_at_only`).

### 3.4. Session Milestone Progression

*   **Nature:** Session milestones (identified by `milestone_type: 'session'`) represent events such as live workshops, webinars, or recorded video sessions.
*   **Progression Mechanics:** They follow the **same locking and unlocking progression rules** as Chapter milestones. They are subject to prerequisite completion (if any are defined before them) and specific `unlock_at` dates, as processed by the **backend milestone unlocking service**.
    *   The idea of sessions being "always visible" or "unlocked by default" refers more to the *potential visibility of information about the session* (like topic, date, time) in the user interface, even if the *progression milestone itself* is still `locked`. The milestone that gates progress adheres to the standard status model (Locked, Unlocked, Completed).
    *   *QA Focus:* Test that session milestones are correctly locked/unlocked based on sequence and `unlock_at` dates, just like chapters.
*   **Completion Mechanism:** Completion of a Session milestone is typically determined by a **post-session activity**, such as an assessment or a feedback survey. This activity usually becomes available for submission only after the session's scheduled end time has passed.
    *   Successfully completing this post-session activity is what formally marks the Session milestone as `completed` in the system. This completion then triggers the backend service to check for and unlock any subsequent milestones in the plan.
    *   *QA Focus:* Verify that post-session assessments become available at the correct time and that their completion correctly updates the Session milestone status and unlocks next steps.

### 3.5. Interactive Ink Activities

*   **Nature:** Ink activities represent interactive client-side experiences embedded within milestones, often used for assessments or reflective exercises. They provide rich, engaging content that goes beyond passive consumption.
*   **Member Experience:** When a member encounters an ink activity in a milestone:
    *   The activity initially appears as a standard activity card with a title, description, and estimated `duration`.
    *   Upon selecting the activity, it starts in the "started" state and launches the interactive ink component in a modal dialog.
    *   The interactive component may include storytelling, guided exercises, reflections, or other interactive elements.
    *   After the member completes the interaction within the Ink application (e.g., by reaching an `onFlowEnd` event), the Ink activity reports back to the Guided Journey system, typically via a dedicated API endpoint.
    *   Completion of the ink activity contributes to the overall milestone completion requirements. If the Ink activity is part of a sequence, upon completion and modal closure, the system may redirect the member to the next step in their journey, such as the next activity or milestone.
*   **Frontend Integration:** Ink activities leverage a specialized frontend infrastructure:
    *   Activities are presented within the milestone's activities list.
    *   The interactive content is loaded in a secure context with appropriate permissions, often using a library like `@betterup/ink-app`.
    *   The frontend handles state management, including activity completion reporting.
    *   Deep linking capabilities allow direct access to specific ink activities when appropriate.
*   **Completion and Progression:** By default, `Ink` activities (like `Assessment` activities) are considered `required_for_milestone_completion`.
    *   This setting is automatically enforced at the system level.
    *   The member must start and complete the ink activity to fulfill milestone requirements.
    *   Completion triggers appropriate progression checks for unlocking subsequent milestones.
*   *QA Focus:* Verify the full member experience with ink activities, including launching in a modal, interacting with, and completing them. Test that progression works correctly upon completion (including potential redirection to the next milestone) and that appropriate validation occurs to prevent invalid completion attempts. Confirm the display of activity `duration`.

---

## 4. Administrative Capabilities & System Management

The Guided Journey system provides administrators with a comprehensive suite of tools for designing, deploying, and managing learning pathways, as well as for overseeing and influencing member progression. This section covers the lifecycle of a Guided Journey, from template creation to plan deployment, member management, and ongoing administrative interventions. These actions are facilitated by dedicated backend services and administrative interfaces.

### 4.1. Creating and Managing Plan Templates
Plan Templates serve as reusable blueprints, streamlining the creation of new Plans.

*   **4.1.1. Overview of Templating**
    *   The Templating Engine allows for the definition of a standard structure that can be consistently reused. This includes defining the overall journey flow, individual milestone structures, tasks within milestones, learning objectives, and even inspirational quotes.
    *   **Note for Administrators:** While templates provide reusability, it's often beneficial to start by creating a standalone Plan to test and refine the journey structure. Once the Plan is mature and proven effective, you can create a Template from it for future reuse (see Section 4.2.9).

*   **4.1.2. Creating a Plan Template**
    *   **Process:**
        1.  Navigate to "Curriculum > Guided Journey > Plan Templates" in the admin interface.
        2.  Click "New Plan Template."
        3.  Enter a `Name` (e.g., "Onboarding Template") and a brief `Description`.
        4.  **Select the desired `Milestone Unlocking Strategy` for this template (e.g., `by_completion_only`, `by_unlock_at_or_completion`). This will be the default strategy for Plans cloned from this template.**
        5.  Save the new Plan Template.
    *   *QA Focus:* Verify that plan templates can be created and saved with appropriate names, descriptions, and a selected `milestone_unlocking_strategy`.

*   **4.1.3. Adding Milestone Templates to a Plan Template**
    *   **Process:**
        1.  Open the newly created Plan Template detail page.
        2.  Click "Add Milestone Template."
        3.  Provide a `Name` (e.g., "Chapter 1," "Session 1"), select `Milestone Type` (e.g., Chapter, Session), set `Duration in Days` or other settings if needed.
        4.  Specify if `Completion is required or optional`.
        5.  Save and repeat for each milestone template needed.
    *   *QA Focus:* Test adding various milestone types with different required/optional settings.

*   **4.1.4. Adding Activity Templates to a Milestone Template**
    *   **Process:**
        1.  From the Milestone Template detail page, click "Add Activity Template."
        2.  Fill in `Title` (e.g., "Intro Video"), `Activity Type` (e.g., Video, PDF, Assessment, Workbook, `Ink`), `Description`, and `Duration` (estimated time in minutes).
        3.  Save each activity template.
        **(System Note on `required_for_milestone_completion`):** The `required_for_milestone_completion` attribute is automatically set to `true` by the system if the `Activity Type` is `Ink` or `Assessment`. For all other activity types (e.g., Video, PDF, Workbook), this attribute will be `false` and cannot be manually set to `true`. Consequently, only Ink and Assessment activities can inherently block milestone completion. Other activity types, even if interacted with, do not gate milestone completion unless an administrator uses the `bypass_completion_of_activities` option when manually completing a milestone.
    *   *QA Focus:* Verify different activity types can be added and their details saved correctly, including the new `Ink` type and `duration`. Test the display of the `associated_record` title if applicable (e.g. for Resource-based activities).

*   **4.1.5. (Optional) Adding Objective Templates to a Milestone Template**
    *   **Process:**
        1.  From the Milestone Template detail page, click "Add Objective Template."
        2.  Provide a `Title` (e.g., "Objective 1: Basics") and `Description` (the outcome or goal).
        3.  Save.
    *   *QA Focus:* Ensure objective templates can be added and their details are stored.

*   **4.1.6. (Optional) Adding Quote Templates to a Milestone Template**
    *   **Process:**
        1.  From the Milestone Template detail page, click "Add Quote Templates."
        2.  Create a New Quote Template, specifying `Author Name` and `Content` (the quote text).
        3.  Save.
    *   *QA Focus:* Verify quote templates can be created and associated with milestone templates.

*   **4.1.7. Reordering Templates**
    *   **Reordering Activity Templates within a Milestone Template:**
        *   Open the Milestone Template detail page and click "Edit Milestone template."
        *   Drag and drop the activity templates into the desired order.
        *   Save/Update.
        *   **Important Note for PM/QA:** Currently, the ordering of Activity Templates impacts the activities across *all plans* created from this template. This behavior is expected to be fixed soon to provide more isolated control.
    *   **Reordering Milestone Templates within a Plan Template:**
        *   Open the Plan Template detail page and click "Edit Plan template."
        *   Drag and drop the milestone templates into the correct order.
        *   Save/Update.
        *   **Impact:** This new order will be reflected in any *future* Plans cloned from this Plan Template. It does not automatically update existing Plans.
    *   *QA Focus:* Test reordering of both activity templates and milestone templates. Verify the stated impact (global for activity templates currently, future for milestone templates).

*   **4.1.8. Impact of Template Changes on Existing Plans**
    *   Once a Plan is created (cloned) from a Plan Template, it generally becomes an independent entity.
    *   Changes made to the underlying Plan Template, Milestone Templates, or Activity Templates **do not retroactively update existing Plans** in most standard system configurations.
    *   To update an active Plan, edits must be made directly to its specific Milestones, Activities, etc.
    *   To ensure future Plans use an updated structure, the relevant Templates must be modified.
    *   *Product Consideration:* Evaluate if dynamic updating of existing Plans from template changes is a required feature for future development.

### 4.2. Creating and Managing Plans
Plans are the live instances of journeys that members interact with, created by cloning Plan Templates.

*   **4.2.1. Cloning a Plan from a Plan Template**
    *   **Process:**
        1.  Go to the "Plan Template Details Page" of the desired template.
        2.  Click "New Plan" from the actions sidebar.
        3.  Provide relevant details for the new Plan.
        4.  Save to clone the template. All Milestones, Activities, Objectives, and Quotes from the template are automatically generated in the new Plan.
    *   *QA Focus:* Verify that cloning a plan template correctly creates a new plan with all associated items.

*   **4.2.1a. Creating a Plan Without a Template**
    *   **Process:**
        1.  Navigate to "Curriculum > Guided Journey > Plans" in the admin interface.
        2.  Click "New Plan".
        3.  Fill in the plan details (Name, Description, Start Date, etc.) without selecting a template.
        4.  **Select the desired `Milestone Unlocking Strategy` for this plan.**
        5.  Save the Plan.
        6.  From the Plan detail page, create Milestones directly by clicking "New Milestone".
        7.  Add Activities, Objectives, and other components to each Milestone as needed.
    *   **Benefits:** This approach allows for iterative development and testing of new journey structures before committing to a reusable template. It's particularly useful for piloting new types of guided journeys.
    *   *QA Focus:* Verify that plans created without templates can be populated with milestones and all required components.

*   **4.2.2. Key Plan Attributes**
    *   **`Start Date` (Required):**
        *   Represents the time when the plan becomes available for members to start and view its content.
        *   A plan can be published before its `Start Date`; members will only gain access once the `Start Date` and time are reached.
    *   **`Group Coaching Series` (Optional):**
        *   Used to assign virtual facilitations sessions to `Session Milestones` within the Plan.
        *   **Required if:** The Plan contains `Session Milestones` that represent virtual facilitations.
        *   **Not Used if:** The Plan does not have `Session Milestones`.
    *   *QA Focus:* Test plan accessibility based on `Start Date`. Verify the requirement for `Group Coaching Series` when `Session Milestones` are present.

*   **4.2.3. (Optional) Editing Cloned Plan Items**
    *   Once a Plan is cloned, its individual components can be customized:
        *   **Milestones:** Adjust descriptions, durations, or ordering within this specific Plan.
        *   **Activities:** Update resource links, instructions, or order within this specific Plan.
        *   **Objectives:** Revise learning outcomes if this Plan instance differs from the template.
        *   **Quotes:** Change or remove as needed for this Plan.
    *   *QA Focus:* Confirm that edits to a cloned plan's items do not affect the original template or other plans cloned from the same template.

*   **4.2.4. (Optional) Adding Resource Lists to Milestones in a Plan**
    *   **Functionality:** Resource Lists are collections of useful files, links, and other resources displayed at the end of a milestone page for members.
    *   **Prerequisite:** Ensure that members are authorized to access the resources included in the list.
    *   *QA Focus:* Test adding resource lists and verify member access based on permissions.

*   **4.2.5. (Optional) Adding Resources to Activities in a Plan**
    *   **Functionality:** Activities can point members towards specific resources (files, links, videos, PDFs) or link to assessments.
    *   **Prerequisite:** Ensure that members are authorized to access these resources.
    *   *QA Focus:* Verify linking resources to activities and test member access.

*   **4.2.6. Reordering Activities within a Plan's Milestone**
    *   **Current Limitation:** Reordering of individual Activities within a live Plan's Milestone is **not supported yet**. The system relies on the order defined in the `Activity Templates` within the `Milestone Template` from which the Plan was cloned.
    *   *Product Note:* This is a known limitation.
    *   *QA Focus:* Confirm that attempts to reorder activities directly within a live plan do not take effect or that the UI prevents this.

*   **4.2.7. Duplicating a Plan**
    *   **Capability:** Administrators can create an exact copy of an existing Plan, with all of its Milestones, Activities, Objectives, and other components.
    *   **Process:** From the Plan detail page, select "Clone Plan" from the Actions sidebar.
    *   **Result:** A new Plan is created with the same structure but with a different name (typically with "Copy" in the title), no published date, and a future start date.
    *   *QA Focus:* Verify that all components are properly cloned and the new Plan remains unpublished.

*   **4.2.8. Viewing Plan Statistics**
    *   **Capability:** Administrators can view aggregated statistics for a plan. This data is crucial for understanding member engagement and overall plan effectiveness. Members may also see a summary of their own statistics.
    *   **Access:** Typically available via a "View Stats" or similar link on the Plan's administrative detail page. A dedicated API endpoint (`/guided_journey/plans/:id/member_stats`) provides member-specific stats including plan identifiers and the total count of session-type milestones in the plan (`session_milestone_count`).
    *   **Information Provided (examples, may vary by specific dashboard/report):**
        *   Total number of members enrolled.
        *   Overall plan completion rates.
        *   Progression through milestones (e.g., number of members who have started, are in progress, or have completed each milestone). This is also available in more detail on the **Admin Milestone Statistics Page** (see Section 2.3).
        *   Activity engagement metrics.
        *   `session_milestone_count`: Total number of session-type milestones in the plan (available via member-specific stats API).
        *   **For specific members or programs (e.g., Dare to Lead), additional detailed stats are available via `ComputeMemberStatsService` (see Section 7.7 for overlay context):**
            *   `Days Learning`: Total number of calendar days the member was engaged with the plan, calculated inclusively from the plan's start date up to their completion date (or current date if still in progress). For example, a plan started on Day 1 and completed on Day 10 counts as 10 days. A plan started on Day 1 and completed on Day 1 also counts as 1 day. The calculation is `((plan_member.status_updated_at || Time.current).to_date - plan.starts_at.to_date).ceil.to_i + 1`.
            *   `Resources Watched`: Number of video activities the member has started or completed.
            *   `Facilitation sessions`: Total number of `session_milestones` defined in the plan structure. This is not member-specific completion but rather the total available in the plan.
            *   `More Daring Leader`: An indicator related to DTL program participation or achievement (e.g., a static value of 1).
            *   `DTL Skills`: A list of skills associated with the Dare to Lead program (e.g., "Rumbling with Vulnerability," "Living into Your Values").
    *   **Underlying Service:** The `ComputeMemberStatsService` is responsible for calculating and providing much of this data, especially the detailed member-specific statistics. The simpler `member_stats` API endpoint provides a subset including `session_milestone_count`.
    *   *QA Focus:* Verify that all displayed statistics are accurate and update correctly. Check different plan types and member progression scenarios. For DTL or similar programs, confirm the presence and accuracy of specialized stats. Confirm the "Days Learning" calculation aligns with the described logic.

*   **4.2.9. Creating a Template from an Existing Plan**
    *   **Capability:** After developing and testing a Plan, administrators can convert it into a reusable Template.
    *   **Process:** From the Plan detail page, select "Create Template From Plan" from the Actions sidebar.
    *   **Result:** A new Plan Template is created with all the structure, content, and configurations of the source Plan. This template can then be used to create new Plans with the same proven structure.
    *   **Best Practice:** Use this capability after piloting a Plan and making necessary refinements, when the structure is mature enough to be reused for multiple cohorts or groups.
    *   *QA Focus:* Verify that the resulting Template accurately reflects the structure of the source Plan and can be used to create new Plans.

*   **4.2.10. Plan Completion Certificates**
    *   **Capability:** Upon successful completion of an entire Plan, members can be issued a PDF certificate. Administrators can select the specific certificate template to be used for a Plan via the admin interface (e.g., choosing between a generic template or a "Dare to Lead" DTL template). The `Plan::Certifiable` module handles aspects of this functionality.
    *   **Generation:** The system generates these certificates in PDF format. Different templates can exist, such as a generic template and a specific "Dare to Lead" (DTL) certificate template which uses specific DTL branding assets (logos, fonts) and a distinct design (e.g., thin borders).
    *   **Content:** Certificates typically include the Plan name, member's name, and completion date. If the plan is associated with a Group Coaching Series and a facilitator (coach) is identified for the member within that series, the facilitator's name may also be included on the certificate.
    *   **Member Access:** Members can download their certificate only after their `PlanMember` status is marked as `completed`. Attempting to access a certificate before completion will result in an error (e.g., 404 Not Found).
    *   **Admin Preview:** Administrators have the ability to preview the certificate design for a given Plan from the Plan's admin page, provided the plan is configured with a certifiable template.
    *   **Implementation Note:** It is a recommended best practice to add the certificate as a downloadable PDF activity within the final milestone of a Plan to provide a clear access point for members.
    *   *QA Focus:* Verify that certificates are generated correctly with accurate information for different templates (generic, DTL). Test admin selection of certificate templates. Test member access restrictions (only available after plan completion). Verify admin preview functionality. Test the scenario of adding the certificate as a final activity.

### 4.3. Managing Members: Addition and Enrollment
Members must be added to a Plan to participate.

*   **Process:**
    1.  Open the Plan Edit Page.
    2.  Locate the section "Import plan members from."
    3.  Select "Series" or "Tracks" as the "Member source type."
        *   **Important:** If the plan contains session milestones, the same `Group Coaching Series` must be specified in both the "Plan Details" and this "Import plan members from" section if importing by Series.
        *   Enrolling members from both Tracks and a Group Coaching Series simultaneously is not supported; choose one source type.
    4.  Select the specific tracks or series from the dropdown list.
    5.  Save the plan.
    6.  On the plan details page, click the "Import Plan Members" link.
*   **Verification:** After import, check the "Plan Members" list to ensure they appear with correct initial statuses (e.g., published, started).
*   *QA Focus:* Test member import from both Series and Tracks. Verify the rule about matching Group Coaching Series. Check initial member statuses.

*   **4.3.1. Removing/Unenrolling Members from a Plan**
    *   **Capability:** Administrators can remove (unenroll) members from a live Plan by deleting their `PlanMember` record, typically accessed through the "Plan Members" area of the admin interface.
    *   **System Impact & User Experience:**
        *   This action is generally irreversible.
        *   The member's progress, including all milestone and activity statuses for that plan, is permanently lost.
        *   The admin interface usually provides strong warnings about these consequences before confirming deletion.
        *   If the member still exists in the original source from which they were imported (e.g., a Track or Group Coaching Series used for the import), they might be re-enrolled if the "Import Plan Members" action is triggered again for that plan, and they would start anew.
    *   *QA Focus:* Verify the unenrollment process, the warnings provided, the loss of progress, and the behavior of re-importing a previously unenrolled member.

### 4.4. Publishing a Plan
Publishing makes the Plan live and accessible to enrolled members according to its `Start Date`.

*   **4.4.1. Pre-Publish Checks**
    *   Ensure all Milestones are configured correctly and in the intended order.
    *   Verify that all members who should start with the plan are enrolled.
    *   Run any available system "health checks" to validate the plan's setup.
    *   *QA Focus:* Identify and execute all available pre-publish health checks.

*   **4.4.2. The Publishing Process**
    *   Click the "Publish" button on the Plan's admin detail page.
    *   The system will change the plan status, typically from `Draft` to `Published`.
    *   *QA Focus:* Monitor the plan status change upon publishing.

*   **4.4.3. Post-Publish Status and Actions**
    *   **Plan Status:** Changes to `Published`.
    *   **Member Status (`Plan Member` component):** Enrolled members may have statuses like `Published` (enrolled, plan is live but member hasn't started) or `Started` (member has begun interacting with the plan).
    *   **Initial Milestone Status (`Member Milestone` component):** Member Milestones are typically set to `Locked` or `Unlocked` based on plan logic and `Start Date`.
    *   **Initial Activity Status (`Member Activity` component):** Member Activities usually show as `Not Started` until a member interacts with them.
    *   **Syncing Members:** You can typically continue to sync/import new Plan Members if new participants need to be added after the initial publish.
    *   **Additional Health Checks:** Some systems run further health checks post-publish.
    *   *QA Focus:* Verify all post-publish statuses for the plan and its members. Test adding members after publishing.

### 4.5. Tracking Member Progress
The Member Engine components provide insights into how members are progressing.

*   **4.5.1. Plan Member Overview**
    *   **Access:** From the plan's detail page, click the "Plan Members: <number> enrolled" link.
    *   **Information:** Provides each participant's overall status in the plan (e.g., `Published`, `Started`, `Completed`).
    *   *QA Focus:* Verify accuracy of the overall member status.

*   **4.5.2. Detailed Member Milestone and Activity Status**
    *   **Access:** For an individual member, go to their "Plan Members" entry and click a "View Stats" link (or similar).
    *   **Member Milestones:** Shows the status of each milestone for that member: `Locked`, `Unlocked`, `In Progress` (if applicable), or `Completed`.
    *   **Member Activities:** Shows the status of each activity for that member: `not_started`, `started`, or `completed`.
        *   **Key Detail for PM/QA:** When a member interacts with an activity (e.g., viewing content), its status typically changes to `started`. The system also tracks when the member's overall plan status (e.g., started, completed) was last updated.
            *   `Video` and `Ink` (Interactive Assessment) activities now open in a modal.
            *   For an activity to be marked `completed` by the member directly through typical API interactions, the system may have specific limitations. For instance, member-facing API endpoints for activity completion might be restricted to certain types. `Ink` activities, for example, might trigger completion based on the `onFlowEnd` callback from the Ink application, which then communicates back to the platform.
            *   Other activity types, especially complex assessments, might be marked `completed` through different mechanisms (e.g., submission to an assessment engine, external system integration, or administrative action) rather than a direct API call by the member to a generic completion endpoint.
            *   Activities like viewing a video or PDF, if not tied to such a specific completable type or assessment, would generally remain `started` after interaction. However, in the UI, these types of `started` activities (excluding `Assessment` and `Ink` types) will visually appear as completed (e.g., with a green check or background). `Started` `Assessment` and `Ink` types will have a different visual treatment (e.g., standard background, "Start" button still available for Ink), indicating they are in progress but not yet fully complete or that interaction can be re-initiated.
    *   *QA Focus:* Test the status transitions for various activity types, including the new `Ink` type. Confirm that `Ink` and `Video` activities open in a modal. Verify how `Ink` activity completion is triggered and reflected (e.g., via `onFlowEnd` and subsequent backend processing). Confirm that assessment completion correctly marks the activity `completed` through its designated pathway. Note how different activity types (e.g., `Ink` vs. video vs. PDF vs. assessment) handle and display `started` and `completed` states, particularly the UI distinction for `started` `Assessment` and `Ink` types. Verify the display of the `associated_record.title` where appropriate.

*   **4.5.3. Statistical Dashboards and Reports**
    *   **Plan-Level Statistics:**
        *   **Access:** From the plan's detail page, click "View Stats" in the Actions sidebar (or a similar link, depending on the admin UI implementation). This may lead to a dedicated statistics page or an API endpoint providing data for a dashboard.
        *   **Information:** Displays aggregate metrics including total enrollments, completion rates, and milestone progression statistics. For specific members (often viewed when drilling down or if the dashboard has member-level views), it can include detailed engagement data derived from services like `ComputeMemberStatsService` and specific API endpoints:
            *   `session_milestone_count`: Total number of session-type milestones in the plan.
            *   `Days Learning`: Total number of days the member has been engaged with the plan, calculated from the plan's start date up to their completion date or the current date if still in progress (rounded up).
            *   `Resources Watched`: The count of unique video activities the member has either started or marked as completed.
            *   `More Daring Leader`: A flag or indicator (e.g., value of 1) often signifying participation or a particular status within specialized programs like "Dare to Lead."
            *   `Skills`: A list of skills relevant to the plan's content, particularly for programs like Dare to Lead (e.g., "Rumbling with Vulnerability," "Living into Your Values," "BRAVING Trust," "Learning to Rise").
        *   **Use Case:** Ideal for understanding overall plan effectiveness and identifying bottlenecks where members might be getting stuck. Allows for tracking member engagement through specific metrics like video consumption, active learning days, and session milestone counts.
    *   **Milestone-Level Statistics:**
        *   **Access:** From any milestone's detail page, click "View Stats" in the Actions sidebar.
        *   **Information:** Shows detailed data about that specific milestone, including how many members are in each status state and activity completion rates.
        *   **Use Case:** Helps identify if a particular milestone is causing progression issues across multiple members.

### 4.6. Manual Unlocking of Milestones
*   **Capability:** Administrators can manually set a specific milestone to the `unlocked` state for an individual member. This action bypasses all standard prerequisite checks and `unlock_at` date restrictions for that member and milestone.
*   **Common Use Cases:**
    *   Addressing specific member issues or exceptions.
    *   Granting early access to content for pilot groups or particular cohorts.
    *   Facilitating testing or content review.
*   **System Impact & User Experience:**
    *   The milestone's status for that member is immediately updated to `unlocked`.
    *   Standard auto-redirection logic (see Section 3.1) will still apply when the member next visits the plan page; they will typically be directed to their earliest unlocked, uncompleted milestone *in sequence*.
    *   However, the manually unlocked milestone will now be accessible if the member navigates to it directly (e.g., through a plan outline).
*   **Admin Interface Options:**
    *   **Unlock for a Single Member:** From a specific Member Milestone's detail page, use the "Unlock Milestone" action to change just that member's status.
    *   **Unlock for All Members:** From the Milestone's detail page (not the Member Milestone), use the "Unlock for all members" action to update the status for every member enrolled in the plan who currently has that milestone locked. This is processed in batches and may take a short time to complete.
*   **Product Considerations & QA Focus:**
    *   A valuable tool for administrative flexibility.
    *   **Risk:** Can lead to members skipping foundational content if they choose to navigate to manually unlocked, out-of-sequence content.
    *   *QA Focus:* Verify that manual unlocking makes the milestone accessible but doesn't incorrectly unlock other milestones or break redirection to the *actual* next-in-sequence item. Confirm the admin action is logged.

### 4.7. Manual Completion of Milestones
*   **Capability:** Administrators can manually mark any milestone as `completed` for a member. This bypasses the need for the member to engage with the content, submit assessments, or meet other standard completion criteria.
*   **System Impact & User Experience:**
    *   The milestone's status for that member is updated to `completed`.
    *   **Crucially, this administrative action triggers the backend milestone unlocking service.** This service will then evaluate and potentially unlock subsequent milestones based on the newly `completed` status of the admin-adjusted milestone.
    *   When the member next visits the plan, auto-redirection will likely advance them to the next appropriate milestone *after* the one manually completed (as per Section 3.1 logic).
*   **Admin Interface Options:**
    *   **Complete for a Single Member:** From a specific Member Milestone's detail page, use the "Complete Milestone" action to mark just that member's milestone as completed.
    *   **Complete for All Members:** From the Milestone's detail page (not the Member Milestone), use the "Complete for all members" action to mark the milestone as completed for all members who have not yet completed it. This action:
        *   Updates the milestone's `member_default_status` to 'completed'
        *   Processes updates for all incomplete Member Milestones in batches
        *   Also marks non-assessment Member Activities associated with the milestone as completed
        *   Triggers the unlocking service for subsequent milestones for each affected member
*   **Common Use Cases:**
    *   Correcting data errors or member records.
    *   Awarding credit for equivalent activities completed outside the platform.
    *   Helping members bypass a technical issue or a step they are legitimately stuck on after appropriate review.
    *   Advancing an entire cohort past a milestone that is no longer relevant or causing progression issues.
*   **Product Considerations & QA Focus:**
    *   Essential for administrative control and resolving exceptions.
    *   **Risk:** If unexpected by the member, this can be disorienting. They might be advanced past content they were actively working on or intended to review.
    *   *QA Focus:* Confirm that manual completion correctly updates the milestone status, triggers the unlock service for subsequent milestones, and that auto-redirection behaves as expected. Test both single-member and bulk completion operations.

### 4.8. Reordering Milestones in an Existing Plan
*   **Capability:** Administrators can change the sequential `position` of milestones within an *existing* Plan structure (Draft or Published).
    *   **Process:** Open the Plan detail page, click "Edit Plan" (or similar), drag and drop milestones, and save.
*   **System Impact & User Experience (especially on live/published plans with active users):**
    *   **Auto-Redirection Adapts Immediately:** Both the frontend redirection engine and the backend milestone unlocking service will always use the *current, updated* milestone sequence for their logic.
    *   **Potential User Disorientation:** A member might be redirected to a different milestone than anticipated if the order has changed since their last visit. This can be particularly confusing if they were in the middle of a sequence.
    *   **Cognitive Dissonance:** If members have formed a mental map of the course structure, reordering (especially of already completed or previously visible content) can create confusion.
    *   **Reminder/Deep Link Integrity:** Reminder emails or externally saved deep links (typically by `id`) will still lead to the correct milestone *content*, but its contextual position and relevance within the plan may have changed significantly.
*   **Product Considerations & QA Focus:**
    *   A vital feature for evolving plan content.
    *   **Risk & Recommendation (from provided text):** When a plan has been published, it is recommended to **refrain from rearranging milestones** if possible. This helps to protect members from receiving unnecessary notifications (e.g., about postponed milestones if a current milestone is moved later) or experiencing confusion.
    *   If reordering is essential on a live plan, develop best-practice guidelines (e.g., plan versioning if available, pre-announcements to users, defining "safe" times for reordering) to mitigate UX disruption.
    *   *QA Focus:* Test extensively how reordering affects auto-redirection for users in various states of completion. Verify that prerequisite checks for unlocking correctly adapt to the new sequence. Check the behavior of deep links. Confirm any system warnings presented to admins before reordering live plan milestones.

### 4.9. Managing `optional` Status of Milestones
*   **Capability:** Administrators can toggle the `optional` (boolean) attribute of a milestone at any time, both in templates and in live plans.
*   **System Impact & User Experience (when changed in a live plan):**
    *   **Changing `required` to `optional`:** If a `required` milestone that was blocking a member's progression is changed to `optional`, the system will re-evaluate unlocking conditions for subsequent milestones. For instance, if M2 (required) was blocking M3, and M1 (prerequisite to M2) was already `completed`, making M2 `optional` would likely cause M3 to unlock immediately (as M2 no longer acts as a required gate). The member might then be redirected to M3.
    *   **Changing `optional` to `required`:** If an `optional` milestone a member has skipped is changed to `required`, it may now block their progression to subsequent milestones until they complete this newly-required item. This could be highly disruptive if not communicated.
*   **Common Use Cases:**
    *   Adjusting plan difficulty or workload based on cohort feedback.
    *   Removing bottlenecks if a required item proves unexpectedly problematic for many users.
    *   Converting a core item to supplementary (or vice-versa) as curriculum evolves.
*   **Product Considerations & QA Focus:**
    *   Provides important flexibility in adapting plans post-launch.
    *   **Risk:** Changing a milestone to `required` mid-stream for active users can create an unexpected new blocker.
    *   *QA Focus:* Test the impact of toggling the `optional` flag on the unlock status of subsequent milestones for users in different states of progress. Verify redirection behavior.

### 4.10. Comprehensive Administrative Capabilities Summary

This section provides a complete overview of administrative interfaces, capabilities, and restrictions at each level of the Guided Journey system.

*   **4.10.1. Plan Administration**
    *   **Available Actions:**
        *   **Publish Plan:** Makes the plan live and accessible to enrolled members according to start date.
        *   **Import Plan Members:** Triggers member enrollment from the configured sources (Series or Tracks).
        *   **Clone Plan:** Creates a duplicate plan with all components for testing or iterative improvement.
        *   **Create Template From Plan:** Converts a successful plan into a reusable template.
        *   **View Stats:** Access detailed plan-level statistics and metrics.
        *   **Edit Plan Details:** Modify plan attributes like name, description, and settings.
    *   **Key Attributes and Their Impact:**
        *   **Internal Name:** Administrative label visible only to admins (can be changed anytime).
        *   **Name:** Public-facing title shown to members (changing after plan is published may confuse active members).
        *   **Description:** Public-facing description (can be enhanced/improved anytime).
        *   **Series:** Connected Group Coaching Series for session milestones (cannot be changed after the plan is published).
        *   **Starts At:** Official start date of the plan (cannot be changed after the plan is published and has started).
        *   **Due Dates Enabled:** Controls whether milestone due dates are shown to members (defaults to `false`; can be toggled anytime, but toggling after start may surprise members).
        *   **Milestone Unlocking Strategy:** Defines how milestones unlock (e.g., by completion, by time). Can be set when the plan is created and changed before the plan starts, but it cannot be changed after the plan has started.
        *   **Member Source Type (Series/Tracks):** Determines the source of members to import (modifiable until members have significantly progressed).
    *   **Critical Restrictions:**
        *   Once a plan is published, the milestone structure should ideally remain stable to avoid disrupting member journeys.
        *   The plan start date should not be changed after members have begun their journey.
        *   Removing a series connection after session milestones are active can break the learning experience.

*   **4.10.2. Milestone Administration**
    *   **Available Actions:**
        *   **Create New Milestone:** Add milestones to a plan before or after publication.
        *   **Reorder Milestones:** Change the sequence of milestones.
        *   **Unlock for All Members:** Manually set the milestone status to `unlocked` for all members simultaneously.
        *   **Complete for All Members:** Manually set the milestone status to `completed` for all members simultaneously.
        *   **View Stats:** Access milestone-specific progression statistics.
    *   **Key Attributes and Their Impact:**
        *   **Name:** The title displayed to members (changing after members have started may cause confusion).
        *   **Milestone Type:** Determines if it's a chapter or session (should not be changed after publication).
        *   **Position:** Controls where in the sequence the milestone appears (changing after members start can disrupt progression).
        *   **Optional:** If true, the milestone doesn't block progression to subsequent required milestones (can be changed, but with caution; see Section 4.9).
        *   **Unlock At:** A specific date/time. If set, this milestone can unlock when this time is reached OR when all preceding required milestones are completed, whichever occurs first. (See Section 3.2 for full details on the "OR" logic). Can be set anytime.
        *   **Duration in Days:** Used for calculating due dates if enabled (can be adjusted, but impacts due dates for all members).
        *   **Member Default Status:** The initial status new members receive when first enrolled (does not affect existing members).
        *   **Resource List:** Collection of resources to display at the end of the milestone (can be updated anytime to enhance content).
    *   **Critical Restrictions:**
        *   **Member Default Status:** Cannot be changed from `completed` to another status once a plan is published.
        *   **Member Default Status:** Cannot be changed back to `locked` from `unlocked` or `completed` once a plan is published.
        *   Significant reordering of milestones in an active plan can create a disorienting experience for members.

*   **4.10.3. Activity Administration**
    *   **Available Actions:**
        *   **Create New Activity:** Add activities to a milestone before or after publication.
        *   **Edit Activity Details:** Modify content, instructions, and resources.
    *   **Key Attributes and Their Impact:**
        *   **Title:** The name displayed to members for the activity (can be improved anytime).
        *   **Description:** Instructions or content for the activity (can be enhanced anytime, even if member activities exist).
        *   **Activity Type:** Type of activity (e.g., assessment, video, pdf, workbook, `ink`). Administrators can set this when creating an activity.
        *   **Associated Record:** The linked resource or assessment. The `title` of this record (e.g., for a `Resource` like a video or PDF) is now available and may be displayed in admin or member UIs. Administrators manage this association.
        *   **Duration:** Estimated time to complete in minutes (can be adjusted anytime by administrators).
        *   **Required for Milestone Completion:** This attribute determines if an activity gates the completion of its parent milestone.
            *   For `Activity Type` `Ink` and `Assessment`, this is automatically set to `true` by the system. These activities *must* be completed by the member for the milestone to be completable (unless an admin bypasses this).
            *   For all other `Activity Types` (e.g., Video, PDF, Workbook), this attribute is always `false` and cannot be changed by administrators. These activity types do not gate milestone completion.
            **(System Note on `required_for_milestone_completion`):** The `required_for_milestone_completion` attribute is automatically set to `true` by the system if the `Activity Type` is `Ink` or `Assessment`. For all other activity types (e.g., Video, PDF, Workbook), this attribute will be `false` and cannot be manually set to `true`. Consequently, only Ink and Assessment activities can inherently block milestone completion. Other activity types, even if interacted with, do not gate milestone completion unless an administrator uses the `bypass_completion_of_activities` option when manually completing a milestone.
    *   **Critical Restrictions:**
        *   Once member activities exist, an activity's type cannot be changed except between resource-based types.
        *   Associated records (like assessments) cannot be modified once member activities exist. (Note: The activity's `description` can be edited even if member activities exist).
        *   Currently, activity reordering within a milestone is not supported for live plans.

*   **4.10.4. Member-Milestone Administration**
    *   **Available Actions:**
        *   **Unlock Milestone:** Manually change the status to `unlocked` for a specific member.
        *   **Complete Milestone:** Manually mark a milestone as `completed` for a specific member.
        *   **View Status History:** See when status changes occurred and who performed them.
    *   **Key Attributes:**
        *   **Status:** Current progression state (`locked`, `unlocked`, or `completed`).
        *   **Status Updated By:** Admin who last changed the status (if manually changed).
        *   **Status Updated At:** Timestamp of the last status change. (Note: The system also tracks the timestamp of the last update to a member's overall plan enrollment status).
    *   **Critical Restrictions:**
        *   Manual interventions at the member-milestone level should be used judiciously to avoid disrupting the intended learning sequence.

*   **4.10.5. Member-Activity Administration**
    *   **Available Actions:**
        *   **Complete Activity:** Manually mark an activity as `completed` for a specific member.
    *   **Key Attributes:**
        *   **Status:** Current state (`unlocked`, `started`, or `completed`).
        *   **Status Updated By:** Admin who last changed the status (if manually changed).
        *   **Status Updated At:** Timestamp of the last status change.
    *   **Critical Restrictions:**
        *   Assessment activities typically require actual assessment completion by the member; administrative overrides should be used only in exceptional cases.

### 4.11. Best Practices for Modifying Live Journeys

*   **4.11.1. Timing of Changes**
    *   **Low-Impact Window:** Make significant structural changes during non-peak hours when fewer members are likely to be actively engaged.
    *   **Between Cohorts:** If possible, major changes should be implemented between cohort cycles rather than during active periods.

*   **4.11.2. Prioritizing Stability**
    *   **Content Enhancements:** Improving descriptions, instructions, or resources (including an Activity's `description`) is generally safe at any time, even after members have started.
    *   **Structural Changes:** Modifications to milestone sequences, types, or progression mechanics should be minimized once members are active.
    *   **Versioning Approach:** For major redesigns, consider creating an entirely new plan rather than heavily modifying an existing one with active members.

*   **4.11.3. Communication Strategy**
    *   **Advance Notice:** When possible, inform members about upcoming changes, especially if they will noticeably impact the user experience.
    *   **Change Documentation:** Maintain internal records of significant changes to aid in troubleshooting if members report unexpected behaviors.
    *   **Support Readiness:** Brief support teams on changes so they can assist members who may be confused by modifications to their journey.

*   **4.11.4. Testing Methodology**
    *   **Admin Preview:** Always test the member experience from an admin account after making changes to ensure they appear as expected.
    *   **Impact Assessment:** For major changes, create test accounts at various stages of progression to verify the change behaves correctly for members at different points in their journey.
    *   **Progressive Deployment:** Consider rolling out significant changes to a small test group before applying them to all active members.

*   **4.11.5. Plan Communication Rules**
    *   **Capability:** The system supports `PlanCommunicationRule`s, which allow administrators to set up automated communications that are sent to members when specific events occur in their journey. This is a powerful tool for engagement, helping to deliver timely information, reminders, or congratulations without manual intervention.
    *   **Enabling the Feature:** For any communication rules to be active for a given plan, the plan's `communications_enabled` attribute must be set to `true`. If this is `false`, no communications will be sent, regardless of the rules configured.
    *   **Current Triggers:** The primary trigger currently implemented is `end_of_plan`. This event is fired when a member's status for the entire plan changes to `completed`.
    *   **How it Works (Example: Plan Completion Email):**
        1.  An administrator creates a `PlanCommunicationRule` for a plan.
        2.  They give it a name (e.g., "Congratulatory Email on Completion").
        3.  They set the `Trigger Type` to `end_of_plan`.
        4.  They provide a `Courier Template Key`, which corresponds to a pre-designed email template in our communication delivery service (Courier).
        5.  The administrator ensures the `Plan` has `communications_enabled` set to `true`.
        6.  When a member successfully completes all required milestones in that plan, the system automatically triggers this rule.
        7.  An email, using the specified Courier template, is sent to the member.
        8.  A record of this communication is created in the system's `CommunicationLog` for administrative tracking.
    *   **Branding:** The `courier_brand_key` on the `Plan` can be used to apply specific branding (e.g., logos, color schemes) to the emails sent via this system.
    *   **Use Cases:**
        *   Send a congratulatory email upon plan completion.
        *   Provide a summary of achievements or a link to a certificate.
        *   Suggest next steps or other relevant learning opportunities.
    *   **QA Focus:**
        *   Verify that a communication is only sent when `communications_enabled` is `true` on the plan.
        *   Confirm that an `end_of_plan` rule is triggered precisely when a member's `PlanMember.status` becomes `completed`.
        *   Check the `CommunicationLog` to ensure a record is created for every communication sent.
        *   Test that the correct `Courier Template Key` is used and the email is branded according to the `courier_brand_key` on the plan.

### 4.12. Best Practices for Modifying Live Journeys

*   **4.12.1. Timing of Changes**
    *   **Low-Impact Window:** Make significant structural changes during non-peak hours when fewer members are likely to be actively engaged.
    *   **Between Cohorts:** If possible, major changes should be implemented between cohort cycles rather than during active periods.

*   **4.12.2. Prioritizing Stability**
    *   **Content Enhancements:** Improving descriptions, instructions, or resources (including an Activity's `description`) is generally safe at any time, even after members have started.
    *   **Structural Changes:** Modifications to milestone sequences, types, or progression mechanics should be minimized once members are active.
    *   **Versioning Approach:** For major redesigns, consider creating an entirely new plan rather than heavily modifying an existing one with active members.

*   **4.12.4. Testing Methodology**
    *   **Admin Preview:** Always test the member experience from an admin account after making changes to ensure they appear as expected.
    *   **Impact Assessment:** For major changes, create test accounts at various stages of progression to verify the change behaves correctly for members at different points in their journey.
    *   **Progressive Deployment:** Consider rolling out significant changes to a small test group before applying them to all active members.

---

## 5. System Behavior: Illustrated Scenarios & Edge Cases

The following scenarios illustrate how the system behaves under various conditions, incorporating the verified redirection and unlocking logic. Each scenario specifies the initial configuration and the expected system behavior, followed by QA focus points.

**Scenario Group A: Basic Progression & Navigation**

*   **Scenario A1: Basic Enrollment and Initial Navigation**
    *   **Initial Configuration/Setup:** New member Jane enrolls in a plan. The first milestone is "Chapter 1: Introduction" (required, `position: 1`). No `unlock_at` date is set.
    *   **System Behavior/Outcome:** Upon successful enrollment, the system typically processes an initial unlock for Chapter 1. When Jane first visits the plan page, the frontend redirection engine identifies Chapter 1 as the first unlocked, required, uncompleted milestone and directs her there.
    *   **Edge Case:** If there's a slight delay in the backend processing that unlocks Chapter 1, and Jane visits the plan page *before* Chapter 1's status is updated to `unlocked`:
        1.  The redirection engine might initially target Chapter 1 (as `position: 1`).
        2.  The frontend validity check would find Chapter 1 is still `locked`.
        3.  The redirection process would re-initiate.
        4.  The UI should display a user-friendly state (e.g., "Plan loading...", "Starting your journey...", or a general plan overview) rather than an error or a blank page, until Chapter 1 becomes `unlocked` and the redirection successfully lands Jane on its page.
    *   **QA Focus Points / Test Considerations:**
        *   Verify successful redirection to the first milestone for a new user.
        *   Simulate delay in initial milestone unlock (if possible via test environment controls) to observe the graceful handling of the "first milestone is locked" edge case. Confirm no redirect loops or error states.

*   **Scenario A2: Sequential Chapter Completion**
    *   **Initial Configuration/Setup:** Jane has completed "Chapter 1: Introduction". "Chapter 2: Core Concepts" (required, `position: 2`) is next and has no `unlock_at` date.
    *   **System Behavior/Outcome:** When Jane completes Chapter 1, the backend completion service marks it `completed`. This triggers the backend milestone unlocking service. Since Chapter 1 (the preceding required milestone) is now complete, Chapter 2 becomes `unlocked`. On Jane's next visit to the plan page, the frontend redirection engine directs her to Chapter 2.
    *   **QA Focus Points / Test Considerations:**
        *   Confirm Chapter 2's status changes from `locked` to `unlocked` immediately after Chapter 1 completion.
        *   Verify redirection to Chapter 2 on subsequent plan page visits.

*   **Scenario A3: Session Navigation with Post-Session Assessment**
    *   **Initial Configuration/Setup:** Jane's current unlocked milestone is "Session 1: Live Workshop" (required). She has attended the session. The next milestone in sequence is "Chapter 2: Follow-up" (required). Session 1 requires a "Post-Workshop Survey" (this could be a standard assessment or an `Ink` activity) for completion, which becomes available after the session's scheduled end time.
    *   **System Behavior/Outcome:** Session 1 remains `unlocked` (but not `completed`) even after Jane attends, until she submits the "Post-Workshop Survey". After the session's end time, the survey becomes available. Once Jane completes and submits the survey, the system marks Session 1 as `completed`. This completion triggers the backend milestone unlocking service, which then unlocks "Chapter 2: Follow-up". Auto-redirection will then target Chapter 2.
    *   **UX Note / Product Consideration:** If the UI doesn't make it clear that the survey (or an `Ink` interactive assessment) is mandatory for progression, Jane might not complete it, and Chapter 2 will remain locked, causing confusion.
    *   **QA Focus Points / Test Considerations:**
        *   Verify that the post-session survey/assessment (which could be an `Ink` activity) only becomes available after the session end time.
        *   Confirm that completing the survey/assessment changes Session 1's status to `completed`.
        *   Verify that Chapter 2 unlocks immediately after Session 1 is marked `completed`.

**Scenario Group B: Administrative Interventions**

*   **Scenario B1: Admin Manual Unlocking of a Later Milestone**
    *   **Initial Configuration/Setup:** Jane is currently working on "Chapter 2" (unlocked, required). "Chapter 3" and "Chapter 4" are `locked`. An administrator manually unlocks "Chapter 5" (required) for Jane.
    *   **System Behavior/Outcome:** Chapter 2 remains Jane's current earliest unlocked, uncompleted, required milestone. Chapter 5 is also now `unlocked` for her. When Jane visits the plan page, the frontend redirection logic will still direct her to Chapter 2 (due to its earlier position). However, if Jane explores the plan outline or navigation menu, she will see Chapter 5 as accessible and can choose to navigate to it directly.
    *   **Risk / Product Consideration:** This allows members to access content out of the intended pedagogical sequence, potentially leading to knowledge gaps if they skip foundational content.
    *   **QA Focus Points / Test Considerations:**
        *   Verify redirection still targets Chapter 2.
        *   Confirm Chapter 5 is accessible via manual navigation.
        *   Ensure no other milestones (like Chapter 3 or 4) were inadvertently unlocked.

*   **Scenario B2: Admin Manual Completion of a Milestone**
    *   **Initial Configuration/Setup:** Jane is actively working on "Chapter 3" (unlocked, required). "Chapter 4" (required) is the next milestone and is currently `locked`. An administrator manually marks Chapter 3 as `completed` on Jane's behalf.
    *   **System Behavior/Outcome:** Chapter 3's status for Jane changes to `completed`. This administrative action triggers the backend milestone unlocking service. Assuming no other unmet conditions (like a future `unlock_at` date on Chapter 4), Chapter 4 will become `unlocked`. On Jane's next visit to the plan page, auto-redirection will likely send her to Chapter 4.
    *   **Risk / Product Consideration:** This can be disorienting for Jane if she was unaware of the admin action, as she might be moved past content she was still reviewing or working on.
    *   **QA Focus Points / Test Considerations:**
        *   Verify Chapter 3 is `completed` and Chapter 4 becomes `unlocked`.
        *   Confirm redirection targets Chapter 4.
        *   Check if any associated activities/assessments within Chapter 3 are also appropriately handled (e.g., marked complete by the system or become read-only).

*   **Scenario B3: Reordering Milestones (Unlocked Milestones Involved)**
    *   **Initial Configuration/Setup:** Jane has "Chapter 1" (`completed`) and "Chapter 2" (`unlocked`). The plan sequence is C1, C2, C3. An administrator reorders the plan to: C1, "Chapter-New" (a newly added chapter), C2, C3.
    *   **System Behavior/Outcome:** The frontend redirection engine and backend unlocking service will now use the new sequence.
        *   If "Chapter-New" is inserted and remains `locked` by default (e.g., it has its own prerequisites not met by C1's completion, or it requires a manual admin unlock as part of the reordering process), Jane will still be directed to C2 (as it's the first unlocked item for her after C1 in the new path).
        *   If "Chapter-New" were configured to be `unlocked` immediately upon insertion (e.g., if it had no prerequisites and the reorder or creation logic triggered an unlock check that passed for it because C1 was complete), Jane would likely be redirected to "Chapter-New".
    *   **Risk / Product Consideration:** Sudden insertion or reordering can confuse Jane regarding the continuity of her learning path. The default state of newly inserted milestones is critical.
    *   **QA Focus Points / Test Considerations:**
        *   Test redirection behavior based on the status of the newly inserted "Chapter-New".
        *   Verify that C2's `unlocked` status is maintained if it's not the direct next step.
        *   Check prerequisite calculations for C2 and C3 based on the new intervening "Chapter-New".

*   **Scenario B4: Reordering Milestones (Completed Milestones Involved)**
    *   **Initial Configuration/Setup:** Jane has "Chapter 1", "Chapter 2", and "Chapter 3" all `completed`. "Chapter 4" is `unlocked`. An administrator moves the `completed` Chapter 2 to appear after Chapter 4. The new order is: C1, C3, C4, C2, ...
    *   **System Behavior/Outcome:** Chapter 2 remains `completed` for Jane, irrespective of its new position. When Jane visits the plan page, auto-redirection will send her to Chapter 4 (as it's the first `unlocked`, uncompleted milestone in the current effective sequence for her).
    *   **Risk / Product Consideration:** This can cause visual dissonance for Jane, as her memory of the course layout (and her completed progress through it) conflicts with the new visual order.
    *   **QA Focus Points / Test Considerations:**
        *   Verify redirection to Chapter 4.
        *   Confirm Chapter 2 still shows as `completed` in its new position.
        *   Ensure the reordering doesn't inadvertently change the status of any milestones.

*   **Scenario B5: Admin Marks Milestone as Optional Mid-Plan**
    *   **Initial Configuration/Setup:** The plan is M1 (required, `completed` by Jane), M2 (required, `unlocked`, Jane is currently stuck on it), M3 (required, `locked`). An administrator changes M2's attribute from `required` to `optional`.
    *   **System Behavior/Outcome:** Since M2 is no longer a `required` prerequisite for M3, and M1 (the actual preceding required milestone for M3 in this context) is `completed`, the backend milestone unlocking service (likely triggered by the status update of M2 or a subsequent progression check) would now evaluate M3 as eligible to unlock. M3 becomes `unlocked`. M2 remains `unlocked` but is now flagged as `optional`.
        *   Auto-redirection: If Jane hasn't completed M2, redirection would likely target M3 (as it's now the next `required` unlocked step, taking precedence over the `optional` M2 if both are unlocked and uncompleted). If M2 was also completed, it would definitely go to M3.
    *   **Benefit / Product Consideration:** This allows flexibility in removing bottlenecks for users during a plan's lifecycle.
    *   **QA Focus Points / Test Considerations:**
        *   Verify M3 unlocks.
        *   Verify M2's status remains `unlocked` and its type changes to `optional`.
        *   Test redirection carefully: if both M2 (now optional) and M3 (required) are unlocked and uncompleted, ensure M3 is prioritized.

**Scenario Group C: Unlocking Logic Variations (Based on `unlock_at` Configuration)**

*   **Scenario C1: Unlock by Prerequisite Completion (Milestone has NO `unlock_at` date)**
    *   **Initial Configuration/Setup:** "Chapter 1" (required) is `completed` by Jane. "Chapter 2" (required, `locked`) has no `unlock_at` date configured.
    *   **System Behavior/Outcome:** Chapter 2 unlocks solely because its prerequisite (Chapter 1) is `completed`. (This is Condition A: Prerequisite Completion being met).
    *   **QA Focus Points / Test Considerations:** Confirm Chapter 2 does *not* unlock before Chapter 1 is complete.

*   **Scenario C2: Unlock by `unlock_at` Date (Prerequisites NOT YET Met)**
    *   **Initial Configuration/Setup:** "Chapter 1" (required) is still `locked` or `unlocked` but not `completed` by Jane. "Chapter 2" (required, `locked`) has an `unlock_at` date/time set for today at 10:00 AM. It is now 10:01 AM.
    *   **System Behavior/Outcome:** Chapter 2 becomes `unlocked` because its `unlock_at` time has passed (Condition B: Time-Based Release is met), even though Chapter 1 is not yet `completed`.
    *   **QA Focus Points / Test Considerations:** Verify Chapter 2 unlocks precisely at/after its `unlock_at` time, irrespective of Chapter 1's status.

*   **Scenario C3: Unlock by Prerequisite Completion (Occurs BEFORE `unlock_at` Date) - Strategy: `by_unlock_at_or_completion`**
    *   **Initial Configuration/Setup:** Plan strategy is `by_unlock_at_or_completion`. "Chapter 1" (required) is `completed` by Jane on Monday. "Chapter 2" (required, `locked`) has an `unlock_at` date/time set for Wednesday.
    *   **System Behavior/Outcome:** Chapter 2 becomes `unlocked` on Monday, as soon as Chapter 1 is `completed` (Prerequisite Completion is met), because the `by_unlock_at_or_completion` strategy uses "OR" logic. It does not wait until Wednesday.
    *   **QA Focus Points / Test Considerations:** Confirm early unlock due to prerequisite completion when strategy is `by_unlock_at_or_completion` and `unlock_at` is in the future.

*   **Scenario C4: Unlock By `unlock_at` AND Completion - Strategy: `by_unlock_at_and_completion`**
    *   **Initial Configuration/Setup:** Plan strategy is `by_unlock_at_and_completion`. "Chapter 2" (required, `locked`) has an `unlock_at` date for Wednesday. "Chapter 1" (required prerequisite) is `completed` by Jane on Monday.
    *   **System Behavior/Outcome:** Chapter 2 remains `locked` on Monday despite Chapter 1 being complete. It will only unlock on Wednesday (or later, if Jane completes Chapter 1 after Wednesday) once its `unlock_at` time has passed AND Chapter 1 is `completed`.
    *   **QA Focus Points / Test Considerations:** Verify that Chapter 2 only unlocks when both conditions (prerequisite met AND `unlock_at` passed) are true under this strategy. Test what happens if `unlock_at` is not set on Chapter 2 (behavior may vary: it might never unlock, or default to completion-only if `unlock_at` is nil).

*   **Scenario C5: Unlock by `unlock_at` Only - Strategy: `by_unlock_at_only`**
    *   **Initial Configuration/Setup:** Plan strategy is `by_unlock_at_only`. "Chapter 1" (required) is still `locked` or `unlocked` but not `completed` by Jane. "Chapter 2" (required, `locked`) has an `unlock_at` date/time set for today at 10:00 AM. It is now 10:01 AM.
    *   **System Behavior/Outcome:** Chapter 2 becomes `unlocked` because its `unlock_at` time has passed, even though Chapter 1 is not yet `completed`.
    *   **QA Focus Points / Test Considerations:** Verify Chapter 2 unlocks precisely at/after its `unlock_at` time, irrespective of Chapter 1's status, under this strategy. Confirm that if Chapter 2 had no `unlock_at` date, it would not unlock.

*   **Scenario C6: Unlock by Completion Only - Strategy: `by_completion_only`**
    *   **Initial Configuration/Setup:** Plan strategy is `by_completion_only`. "Chapter 1" (required) is `completed` by Jane. "Chapter 2" (required, `locked`) has an `unlock_at` date/time set for tomorrow.
    *   **System Behavior/Outcome:** Chapter 2 becomes `unlocked` immediately after Jane completes Chapter 1, because its prerequisite is met. The future `unlock_at` date is ignored under this strategy.
    *   **QA Focus Points / Test Considerations:** Verify Chapter 2 unlocks based on prerequisite completion only, and any `unlock_at` date is disregarded.

**Scenario Group D: Optional Milestones**

*   **Scenario D1: Optional Milestone Does Not Block Progress & Unlocks Concurrently**
    *   **Initial Configuration/Setup:** Plan sequence: M1 (required), M2 (optional, `locked`), M3 (required, `locked`). No `unlock_at` dates are set on M2 or M3.
    *   **Action:** Jane completes M1.
    *   **System Behavior/Outcome:**
        1.  M3 (the next `required` milestone) becomes `unlocked`. This is because its direct `required` prerequisite (M1) is complete, and M2 (being `optional`) does not block this.
        2.  M2 (the `optional` milestone) will also become `unlocked`. This is because its own implicit prerequisite (M1) is now complete, and it has no other unmet conditions.
    *   **User Experience:** Jane can proceed to M3. M2 is also available for her to engage with if she chooses.
    *   **QA Focus Points / Test Considerations:** Verify that *both* M2 and M3 unlock. Confirm that if Jane skips M2 and completes M3, her plan progression is still valid.

**Scenario Group E: Complex Interactions & Other Cases**

*   **Scenario E1: Auto-Redirection with Multiple Milestones Unlocked Out of Sequence**
    *   **Initial Configuration/Setup:** Due to a combination of administrative actions or `unlock_at` dates, Jane's plan has the following statuses and types in sequence:
        *   Chapter 1 (Required, `completed`)
        *   Chapter 2 (Required, `unlocked`)
        *   Chapter 3 (Required, `locked`)
        *   Chapter 4 (Optional, `unlocked`)
        *   Chapter 5 (Required, `unlocked`)
    *   **System Behavior/Outcome:** When Jane visits the plan page, auto-redirection sends her to **Chapter 2**. This is because it's the first `required` milestone in the sequence that is `unlocked` and uncompleted (Rule #1 of Redirection Priority).
    *   **Risk / Product Consideration:** Jane might manually navigate to Chapter 4 (optional) or Chapter 5 (required, but further along), potentially skipping important content in Chapter 2 and the (currently locked) Chapter 3.
    *   **QA Focus Points / Test Considerations:** Confirm redirection specifically targets Chapter 2. Verify all other unlocked milestones (Chapter 4, Chapter 5) are accessible via manual navigation. Confirm the `title` of associated records (e.g. for Resources) is displayed correctly for activities. Test that `Video` and `Ink` activities open in modals, and that `Ink` activities have the correct UI styling (e.g., not appearing "completed" just by being `started` and retaining the "Start" button). Verify that the timestamp for the member's overall plan status updates correctly on status changes.

*   **Scenario E2: Impact on Navigation When Reminders are Misaligned Due to Reordering**
    *   **Initial Configuration/Setup:** Jane has "Chapter 3" `unlocked` and receives a reminder email with a direct link to it. Before she clicks the link, an administrator reorders the plan, moving Chapter 3 to a much later position in the sequence.
    *   **System Behavior/Outcome:** The reminder link (which likely uses the milestone's unique `id`) will still direct Jane to the content of Chapter 3. However, its `position` and surrounding context within the plan have now changed. If she then navigates back to the main plan page, auto-redirection will take her to her *actual* current earliest unlocked step based on the *new* sequence.
    *   **Risk / Product Consideration:** This can cause significant confusion for Jane. The reminder's implied guidance ("work on this next") no longer matches the live plan structure, potentially undermining trust in system communications. This scenario also highlights the importance of how `PlanCommunicationRule` (see Section 4.11) configurations for reminders would need to consider such plan modifications to maintain relevance.
    *   **QA Focus Points / Test Considerations:** Test that deep links to milestones continue to work after reordering. Observe and document the potential for user confusion when the reminder's context is no longer accurate.

*   **Scenario E3: Generic Plan Completion with New Activity Features**
    *   **Initial Configuration/Setup:** Member David is enrolled in the "Leadership Essentials Program" (using a `generic` completion certificate). The plan includes several milestones. One of the later milestones, "Advanced Communication Skills," is marked as `optional` and contains an `Ink` activity titled "My Values Journey" with a displayed `duration` of "45 min". All preceding required milestones are completed by David.
    *   **User Action & System Behavior (Progression):**
        1.  David completes the final *required* milestone in the plan.
        2.  His `PlanMember` status updates to `completed`.
        3.  (The Plan Completion Celebration Overlay, as currently implemented specifically for Dare to Lead plans as detailed in Section 7.7, would not appear for this generic plan.)
    *   **User Action & System Behavior (Optional Ink Activity):**
        1.  Sometime later, David decides to explore the `optional` "Advanced Communication Skills" milestone.
        2.  He sees the "My Values Journey" `Ink` activity (detailed in Section 3.5) with its "45 min" `duration` displayed.
        3.  He clicks to start it, and it opens in a modal. He completes the Ink flow.
        4.  The `Ink` activity is marked as `completed`. Since the milestone is `optional`, this doesn't change his overall plan completion status.
    *   **Administrator Action & System Behavior (Verification):**
        1.  An administrator navigates to the "Leadership Essentials Program" in the admin interface.
        2.  They access the **Milestone Statistics Page** for the "Advanced Communication Skills" milestone (as described in Section 4.5.3).
        3.  The admin can see that David has a `completed` status for the "My Values Journey" `Ink` activity within that optional milestone, and can see overall engagement stats for that milestone.
    *   **QA Focus Points / Test Considerations:**
        *   Verify behavior when a non-DTL plan (using a generic certificate) is completed, noting that the DTL-specific overlay (Section 7.7) should not appear.
        *   Confirm `Ink` activity launches in a modal and its `duration` is displayed.
        *   Ensure completion of an `optional` milestone/activity after plan completion doesn't alter plan status.
        *   Verify the Admin Milestone Statistics Page accurately reflects activity completion for optional milestones.

---

## 6. System Analysis: Strengths, Current Challenges, and UX Considerations

### 6.1. Strengths
*   **Prioritized Auto-Redirection Logic:** The multi-step redirection logic (Section 3.1) is intelligent and generally guides users effectively to their most relevant current task, minimizing the need for manual searching and providing a clear path forward.
*   **Flexible Milestone Unlocking (Current "OR" Logic):** The existing mechanism, combining prerequisite completion with optional per-milestone `unlock_at` dates (Section 3.2), offers a good balance, supporting both self-paced learning and scheduled content release cadences.
*   **Effective Support for Optional Content:** The system's handling of optional milestones (Section 3.3) allows for the inclusion of supplementary material without disrupting the flow of required content, offering valuable enrichment opportunities.
*   **Robust Administrative Capabilities:** Administrators have granular control over member progression through manual status changes (unlock/complete) and plan reordering (Section 4). These tools are essential for managing exceptions, correcting errors, and evolving curriculum.
*   **Clear and Distinct Progression States:** The Locked, Unlocked, and Completed model for milestone statuses (per member) is straightforward and easy to understand.

### 6.2. Current Challenges & Key UX Considerations
*   **Misalignment on "Plan-Level Unlocking Strategies":**
    *   **The Core Issue:** The most significant current challenge is the discrepancy between the documented ideal of four selectable plan-level unlocking strategies and the actual system behavior. The system currently enforces only the "Prerequisite Completion OR `unlock_at` Time" logic per milestone, and the admin UI for selecting other plan-wide strategies is non-functional.
    *   **Impact:** This can lead to significant confusion for plan administrators and product teams if they design learning experiences or configure plans based on the unimplemented strategies (like a strict "AND" logic for time and prerequisites). It limits the current toolkit for crafting diverse cohort-based or strictly time-gated learning models.
    *   **Product & QA Action:** All documentation and training must be updated to reflect the current reality. QA should not test for the unimplemented plan-level strategies.
*   **User Experience Impact of Administrative Overrides:**
    *   While powerful and necessary, actions like manual unlocking, manual completion, or reordering of live plans can significantly disrupt a user's intended or expected learning path (detailed in Sections 4 & 5).
    *   **UX Considerations:** Such actions can lead to unexpected jumps in content, cognitive dissonance if the plan structure changes abruptly, or a feeling of lost control over one's learning journey. Clear communication strategies or system notifications for affected users might be needed.
*   **Risk of Content Skipping with Manual Navigation:**
    *   If multiple milestones are unlocked out of sequence (e.g., due to admin actions or permissive `unlock_at` dates), users have the freedom to manually navigate to any of them. While auto-redirection attempts to enforce a logical sequence, this freedom can lead to gaps in learning if users bypass foundational content.
*   **Clarity of Session Completion Requirements:**
    *   Users must clearly understand that completing a "Session" milestone often involves more than just attendance; a post-session activity (like an assessment, survey, or an `Ink` interactive assessment) is typically required to trigger formal completion and unlock subsequent content. If this is not obvious in the UI, progression can stall.
*   **Graceful Handling of "All Milestones Locked" / Initial Load States:**
    *   The precise UI/UX when no milestone is immediately valid for redirection (e.g., on first load for a new user if backend processing is delayed, or if all future content is time-gated) needs to be exceptionally robust and clear to avoid user confusion or the appearance of system errors.
*   **Integrity of Reminder Links After Plan Reordering:**
    *   Deep links in reminder emails point to specific milestone content. If that milestone is significantly reordered within the plan after the reminder is sent, the context of the link can become misleading, potentially frustrating or confusing the user.

---

## 7. Product Strategy & Future Development Opportunities

This section outlines key strategic questions and potential areas for system enhancement, based on the current capabilities and identified challenges.

### 7.1. Critical: Leverage and Refine Unlocking Strategy Functionality
*   **Current Status:** The system now implements a suite of four plan-level unlocking strategies (`by_completion_only`, `by_unlock_at_or_completion`, `by_unlock_at_and_completion`, `by_unlock_at_only`), providing robust control over milestone progression. This addresses a major previous limitation.
*   **Strategic Focus:**
    1.  **Administrator Training & Documentation:** Ensure administrators are well-versed in the behavior of each unlocking strategy and its interaction with milestone-specific `unlock_at` dates. Clear, concise documentation with examples for each strategy is paramount.
    2.  **UI/UX for Strategy Selection:** Continuously evaluate and refine the admin interface for selecting plan-level strategies. Ensure that descriptions, tooltips, and any visual aids clearly communicate the implications of each choice.
    3.  **Edge Case Handling & QA:** Maintain rigorous QA processes to cover all strategy combinations, especially concerning milestones with and without `unlock_at` dates, and the behavior when `unlock_at` might be nil under strategies that use it (e.g., `by_unlock_at_and_completion`). Ensure predictable and well-documented behavior for such edge cases.
    4.  **Feedback Loop:** Establish a feedback mechanism with curriculum designers and administrators to understand how these strategies are being used in practice, identify any common points of confusion, or gather requirements for potential future refinements.
*   **Future Considerations (Post-Implementation):**
    *   While the current set of strategies is comprehensive, future needs might emerge for even more granular control (e.g., milestone-level overrides of the plan strategy, or more complex conditional logic). Such enhancements should be considered based on evolving product vision and user feedback.
    *   Explore if visual aids or simulators within the admin UI could help administrators preview how their chosen strategy would affect a typical member's journey through a plan.

### 7.2. Enhance User Experience for Boundary and Edge Cases
*   **"All Milestones Locked" / Initial Plan Load Experience:**
    *   **Opportunity:** Design and implement a clear, consistent, and user-friendly state when no milestone is immediately available for redirection. This should prevent any visual indication of errors or redirect loops. Options include:
        *   A dedicated "Plan Overview" display.
        *   A "Content Starting Soon" or "Your Journey is Being Prepared" message.
    *   *QA Focus:* Ensure this state is robust and handles all variations of initial load or fully locked future content.
*   **"Plan Completed" Experience:**
    *   **Opportunity:** Evaluate the product need and value of a distinct "Plan Completion" page or state. This could go beyond redirection to the last completed item and include:
        *   A summary of achievements.
        *   A congratulatory message.
        *   Links to "what's next" (e.g., other relevant plans, resources).
        *   Access to any certificates earned.
    *   This would be a net-new feature enhancement.

### 7.3. Clarify and Refine Session-Related Interactions
*   **Session Content Visibility vs. Milestone Lock State:**
    *   **Decision Point for Product:** Should users be able to access preparatory content or logistical details for a Session milestone (e.g., pre-reading materials, virtual meeting links) even if the Session *milestone itself* (which is formally completed by a post-session assessment) is still technically `locked` in their progression sequence? Define clear business rules and UX for this.
*   **Post-Session Assessment Clarity & Workflow:**
    *   **Opportunity:** Enhance UI/UX to make it unequivocally clear to members when a post-session assessment or activity (including `Ink` activities) is required to complete a Session milestone and unlock subsequent content. Consider visual cues, notifications, or direct calls to action from the session content page.

### 7.4. Refine Administrative Tools & Develop Safeguards
*   **Admin UI for Unlocking Mechanisms:**
    *   Ensure the admin interface for setting milestone `unlock_at` dates and selecting the **plan-level `milestone_unlocking_strategy`** clearly communicates and reinforces their interaction. Tooltips or help text should be precise for each strategy, explaining how it interprets an `unlock_at` date (or its absence).
*   **Managing the Impact of Reordering Live Plans:**
    *   **Opportunity:** Explore and potentially implement system mechanisms or documented best-practice guidelines to mitigate UX disruption when administrators need to reorder milestones in published plans that have active users. Ideas include:
        *   Plan versioning, allowing changes to a new version while existing users complete the old one.
        *   System-generated warnings to admins about the number of active users on a plan before reordering.
        *   Batch communication tools to inform affected users of significant structural changes.
        *   A temporary "plan maintenance mode" for administrators.

### 7.5. Define and Develop a Comprehensive Reminder System
*   **Product Requirements Definition Needed:** The current mention of a reminder system is general. The "Plan Communication Rules" capability (Section 4.11) provides a potential foundation for a more comprehensive reminder system, but detailed product definition is required:
    *   **Configuration Granularity:** How should the "X days" for triggering reminders be set (per plan, per milestone type, globally, or admin-configurable per instance)? How will Plan Communication Rules be used to configure this?
    *   **Reminder Content:** What information should reminder emails/notifications contain? Should they be customizable (potentially via Plan Communication Rules configurations)?

### 7.6. Plan Communication Rules
Administrators can configure `PlanCommunicationRule`s to trigger automated communications (via Courier) to members based on specific events or timing within their journey. For example, sending a reminder if a milestone is approaching its due date or a congratulatory message upon completion.
*   **Enabling Communications:** The `communications_enabled` flag on the `Plan` must be true for these rules to be active.
*   **Branding:** The `courier_brand_key` on the `Plan` allows for customized branding of these communications.

### 7.7. Plan Completion Celebration Overlay (Dare to Lead Specific)
To enhance the sense of achievement, a special "Plan Completion Celebration Overlay" is displayed to members when they complete a Guided Journey plan that is configured with the `'dare_to_lead'` completion certificate template.

*   **Trigger:** Appears automatically when the member's overall plan status transitions to `completed` for a DTL-configured plan. The overlay is designed to appear only once and only if the plan was completed recently (within the last 3 days) to ensure it is timely and not repetitive.
*   **Content Displayed:**
    *   **Plan Name:** The name of the Guided Journey plan they have just completed.
    *   **DTL Skills:** A predefined list of skills associated with the Dare to Lead™ program (e.g., "Rumbling with Vulnerability," "Living into Your Values", "Braving Trust", "Learning to Rise").
    *   **DTL Badge:** A visual badge or image specific to Dare to Lead™ program completion (`badge-dtl-trained.png`).
    *   **Dynamic Statistics:**
        *   **Days Learning:** The total number of calendar days the member was engaged with the plan, calculated from the plan's start date up to their completion date. For example, a plan started on Jan 1 and completed on Jan 1 counts as 1 day. A plan started on Jan 1 and completed on Jan 2 counts as 2 days.
        *   **Resources Watched:** The count of unique video activities the member started or completed within the plan.
        *   **Facilitation Sessions:** The total number of live facilitation session milestones included *in the plan structure* (note: this is a count of all session milestones available in the plan, not necessarily those attended by the specific member).
        *   **"More Daring Leader":** A celebratory static statistic (displayed as the number `1`) indicating their growth and program completion.
*   **User Interaction:** The member can dismiss the overlay to return to their program view. Once dismissed, it will not appear again for that plan completion.
*   **Purpose:** Provides immediate positive reinforcement and highlights key takeaways and achievements, creating a memorable and rewarding conclusion to the "Dare to Lead" program.

*QA Focus:*
*   Verify the overlay appears only for plans with the `'dare_to_lead'` certificate template upon completion. Check that it does *not* appear for plans with the `generic` template.
*   Confirm all content elements (plan name, DTL skills, DTL badge, dynamic stats) are displayed correctly and match the data provided by the backend.
*   Test the trigger logic:
    *   The overlay should appear immediately upon plan completion.
    *   It should not appear if the plan was completed more than 3 days ago.
    *   After dismissing the overlay, it should not reappear on subsequent visits to the page. Test this by reloading the page.
    *   Verify that different users completing different DTL plans see the overlay independently and that dismissing it for one user/plan does not affect another.
*   Check the accuracy of the dynamic statistics:
    *   "Days learning": Test with same-day completion, next-day completion, and completion after several days.
    *   "Resources watched": Test scenarios where a member watches some, all, or no videos. Verify that both `started` and `completed` videos are counted.
    *   "Facilitation sessions": Confirm this number matches the total `session` type milestones in the plan's structure, regardless of member attendance.
*   Test the dismissal of the overlay via the "Return to your program" button.

---

## 8. Conclusion

The Guided Journey system is a powerful tool that enables the creation and management of structured learning experiences for members. By understanding its capabilities, limitations, and best practices, administrators and product teams can design and configure plans that effectively support diverse learning objectives and pedagogical approaches.

This document provides a comprehensive overview of the Guided Journey system, including its key components, functionality, and usage scenarios. It also highlights current challenges and opportunities for future development, as well as best practices for modifying live journeys.

By systematically addressing these strategic questions and development opportunities, the Guided Journey system can be made even more robust, intuitive, user-friendly, and closely aligned with diverse pedagogical approaches and business objectives.
