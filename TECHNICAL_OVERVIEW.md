<!--
AI INSTRUCTIONS — Read and Follow all the AI Instructions in the sibling README.md before updating this file.
-->

## 1. Introduction

The Guided Journey module is a structured learning and coaching system designed to facilitate sequential learning experiences. It enables the creation of guided plans with defined milestones, activities, and objectives, allowing members to progress through structured learning paths.

## 2. System Architecture

The system is built on a three-layer architecture:

### 2.1. Templating Layer
- **Purpose**: Defines the reusable blueprints or templates for journey structures. These templates are not directly visible to or interactive for members. They serve as the foundation from which active plans are generated in the Deployment Layer.
- **Core Models**: `PlanTemplate`, `MilestoneTemplate`, `ActivityTemplate`, `ObjectiveTemplate`.
- **Access**: Primarily for administrators to design, create, and manage these foundational content templates.

### 2.2. Deployment Layer
- **Purpose**: Handles the instantiation of templates into active, member-facing plans.
- **Core Models**: `Plan`, `Milestone`, `Activity`, `Objective`, `Quote`, `PlanMember`, `PlanCommunicationRule`, `PlanMemberImportConfig`.
- **Functionality**: Manages the transition from abstract templates (from the Templating Layer) to concrete, active plan instances for members. This layer also includes configurations for member enrollment and plan-specific communications.

### 2.3. Member Layer
- **Purpose**: Tracks individual user progress and interactions within a plan.
- **Core Models**: `MemberMilestone`, `MemberActivity`.
- **Functionality**: Handles user-specific state, progress tracking, and activity completion.

## 3. Core Components and Data Models

*(All models are namespaced under `GuidedJourney` module. Most models include `::GuidedJourney::ClonesAttributes` for duplicating records, and many text attributes are normalized using `StripWhitespaceNormalizer`.)*

### 3.1. Templating Layer Models

-   **`PlanTemplate`** (`plan_template.rb`)
    *   Defines the overall structure of a journey template.
    *   Includes `::GuidedJourney::HumanEnumName`.
    *   **Key Attributes**:
        *   `name` (String, presence validated)
        *   `description` (String, presence validated)
        *   `milestone_unlocking_strategy` (Enum, from `GuidedJourney::Plan.milestone_unlocking_strategies`, default: `:by_completion`)
    *   **Clonable Attributes**: `name`, `description`, `milestone_unlocking_strategy`.
    *   **Associations**:
        *   `has_many :milestone_templates` (ordered, dependent: :destroy)
        *   `has_many :plans` (dependent: :destroy)
    *   **Other**: Accepts nested attributes for `milestone_templates`.

-   **`MilestoneTemplate`** (`milestone_template.rb`)
    *   Defines stages or modules within a `PlanTemplate`.
    *   Includes `GuidedJourney::OrdersList` (scoped to `plan_template`).
    *   **Key Attributes**:
        *   `name` (String, presence validated)
        *   `description` (String)
        *   `milestone_type` (Enum: `session`, `chapter`, presence validated)
        *   `duration_in_days` (Integer, >= 0, default: 0)
        *   `resource_list_uuid` (UUID, foreign key for `ResourceList`)
        *   `position` (Integer, ordered)
        *   `member_default_status` (Enum, from `MemberMilestone.statuses`, presence validated)
        *   `optional` (Boolean, default: `false`)
    *   **Clonable Attributes**: `name`, `description`, `milestone_type`, `duration_in_days`, `resource_list_uuid`, `position`, `member_default_status`, `optional`.
    *   **Associations**:
        *   `belongs_to :plan_template`
        *   `belongs_to :resource_list` (optional)
        *   `has_many :quote_templates` (dependent: :destroy)
        *   `has_many :activity_templates` (ordered, dependent: :destroy)
        *   `has_many :objective_templates` (dependent: :destroy)
        *   `has_many :milestones` (dependent: :destroy)
    *   **Other**: Accepts nested attributes for `activity_templates`. Provides `session_number` and `chapter_number` methods.

-   **`ActivityTemplate`** (`activity_template.rb`)
    *   Defines specific tasks, content, or interactions within a `MilestoneTemplate`.
    *   Includes `GuidedJourney::OrdersList` (scoped to `milestone_template`).
    *   **Key Attributes**:
        *   `title` (String, presence validated)
        *   `description` (String)
        *   `activity_type` (Enum: `assessment`, `pdf`, `video`, `workbook`, `ink`)
        *   `associated_record_uuid` (UUID)
        *   `associated_record_type` (String)
        *   `duration` (Integer, e.g., minutes for estimated completion time)
        *   `position` (Integer, presence validated, ordered)
        *   `required_for_milestone_completion` (Boolean, validation ensures this can only be true for `ink` or `assessment` types. Its application in gating milestone completion is determined by `CompleteMemberMilestoneService` logic.)
    *   **Clonable Attributes**: `title`, `description`, `activity_type`, `associated_record_uuid`, `associated_record_type`, `duration`, `position`, `required_for_milestone_completion`.
    *   **Associations**:
        *   `belongs_to :milestone_template`
        *   `belongs_to :associated_record` (polymorphic, e.g., `AssessmentConfiguration`, `Resource`)
        *   `has_many :activities` (dependent: :destroy)
    *   **Other**: `attr_accessor :associated_assessment_id, :associated_resource_id`.

-   **`ObjectiveTemplate`** (`objective_template.rb`)
    *   Defines learning or achievement goals associated with `MilestoneTemplate`s.
    *   **Key Attributes**:
        *   `title` (String, presence validated)
        *   `description` (String, presence validated)
    *   **Clonable Attributes**: `title`, `description`.
    *   **Associations**:
        *   `belongs_to :milestone_template`
        *   `has_many :objectives` (dependent: :restrict_with_error)

-   **`QuoteTemplate`** (`quote_template.rb`)
    *   Stores quotes associated with `MilestoneTemplate`s.
    *   **Key Attributes**:
        *   `content` (String, presence validated)
        *   `author_name` (String, presence validated)
    *   **Clonable Attributes**: `content`, `author_name`, `author_image` (via ActiveStorage).
    *   **Associations**:
        *   `belongs_to :milestone_template`
    *   **Other**: `has_one_attached :author_image` (dependent: :destroy), validates image properties.

### 3.2. Deployment Layer Models

-   **`Plan`** (`plan.rb`)
    *   An instance of a `PlanTemplate` that members can be enrolled in.
    *   Includes `::GuidedJourney::HumanEnumName`, `::GuidedJourney::Plan::Certifiable`.
    *   **Key Attributes**:
        *   `name` (String, presence validated)
        *   `internal_name` (String, presence validated)
        *   `description` (String, presence validated)
        *   `published_at` (Datetime)
        *   `starts_at` (Datetime, presence validated)
        *   `due_dates_enabled` (Boolean)
        *   `milestone_unlocking_strategy` (Enum: `by_completion` (default), `by_unlock_at_time`, `by_completion_and_unlock_at_time`, `by_completion_or_unlock_at_time`)
        *   `communications_enabled` (Boolean, default: `false`)
        *   `courier_brand_key` (String)
        *   `completion_certificate_template` (Enum: `generic`, `dare_to_lead`). This attribute also implicitly controls the `celebration_overlay_enabled` feature (see Section 4.3).
    *   **Clonable Attributes**: `name`, `internal_name`, `description`, `due_dates_enabled`, `milestone_unlocking_strategy`.
    *   **Associations**:
        *   `belongs_to :plan_template` (optional)
        *   `belongs_to :series` (optional, `GroupCoachingSeries`)
        *   `has_many :milestones` (dependent: :destroy)
        *   `has_many :member_milestones` (through `milestones`)
        *   `has_many :activities` (through `milestones`)
        *   `has_many :chapter_milestones`, `has_many :session_milestones` (scoped `Milestone` associations)
        *   `has_many :plan_members` (dependent: :destroy)
        *   `has_many :members` (through `plan_members`, source: `User`)
        *   `has_many :plan_communication_rules` (dependent: :destroy)
        *   `has_many :communication_logs` (dependent: :destroy)
        *   `has_one :plan_member_import_config` (dependent: :destroy)
    *   **Other**: Broadcasts on create/update. Scopes: `published`, `unpublished`, `upcoming`, `past`. `before_create :init_milestones` (clones from template). Methods `published?`, `started?`.
        *   **Serialization (`PlanSerializer`)**:
            *   The `celebration_overlay_enabled` attribute is dynamically determined: `object.completion_certificate_template == 'dare_to_lead'`. This boolean flag is then available to the frontend to control the display of the Plan Completion Overlay. For product details, see `PRODUCT_OVERVIEW.md` Section 7.7.
        *   **Immutability Rules**:
            *   `milestone_unlocking_strategy`: Cannot be changed if `published_at` is set and `starts_at` is in the past.
            *   `series_id`: Cannot be changed if `published_at` is set.
            *   `starts_at`: Cannot be changed if `published_at` is set and `starts_at` is in the past.
        *   A plan may be considered to "require unlock dates" if its `milestone_unlocking_strategy` involves `unlock_at` (e.g., `by_unlock_at_time`, `by_completion_and_unlock_at_time`, `by_completion_or_unlock_at_time`). This influences validation for `Milestone.unlock_at` and ensures that milestones under such plans have their `unlock_at` dates set.
        *   **Certifiable Module (`::GuidedJourney::Plan::Certifiable`)**: This concern is included in the `Plan` model.
            *   Defines an `enum` for `completion_certificate_template` with values `:generic` and `:dare_to_lead`.
            *   Provides `has_completion_certificate?` to check if a template is selected.
            *   Includes a `completion_certificate_pdf` method which takes `member_name`, `completion_date`, and an optional `facilitator_name`. It instantiates the appropriate PDF class (`GenericPlanCompletionCertificatePdf` or `DtlPlanCompletionCertificatePdf`) using `GuidedJourney::CertificateDetails` to pass data.

-   **`Milestone`** (`milestone.rb`)
    *   A specific instance of a milestone within a `Plan`.
    *   Includes `GuidedJourney::OrdersList` (scoped to `plan`).
    *   Inherits clonable attributes and enum types (`milestone_type`, `member_default_status`) from `MilestoneTemplate`.
    *   **Key Attributes**: (Similar to `MilestoneTemplate`) `name`, `description`, `milestone_type`, `duration_in_days`, `resource_list_uuid`, `position`, `member_default_status`, `optional`, `unlock_at` (Datetime, validated if plan requires unlock dates).
    *   **Associations**:
        *   `belongs_to :plan`
        *   `belongs_to :milestone_template` (optional)
        *   `belongs_to :resource_list` (optional)
        *   `has_many :activities` (dependent: :destroy)
        *   `has_many :member_milestones` (dependent: :destroy)
        *   `has_many :objectives` (dependent: :destroy)
        *   `has_many :quotes` (dependent: :destroy)
    *   **Other**: Broadcasts on create. Scopes: `chapter_milestones`, `session_milestones`, `with_past_unlock_at`, `optional`, `required`. `before_create` callbacks to init activities, objectives, and quotes from templates. `due_at` calculated method.
    *   **Associated Service**: `ComputeMemberStatsService`.
    *   **Authorization**: `PlanPolicy#member_stats?`.

-   **`Activity`** (`activity.rb`)
    *   A specific instance of an activity within a `Milestone`.
    *   Includes `GuidedJourney::OrdersList` (scoped to `milestone`).
    *   Inherits clonable attributes and enum type (`activity_type`) from `ActivityTemplate`.
    *   **Key Attributes**: (Similar to `ActivityTemplate`) `title`, `description`, `activity_type`, `associated_record_uuid`, `associated_record_type`, `position`, `duration`, `required_for_milestone_completion`.
    *   **Associations**:
        *   `belongs_to :milestone`
        *   `belongs_to :activity_template` (optional)
        *   `belongs_to :associated_record` (polymorphic, e.g., `AssessmentConfiguration`, `Resource`)
        *   `has_many :member_activities` (dependent: :destroy)
        *   `has_one :plan` (through `milestone`)
    *   **Other**: Broadcasts on create. Custom R/W for `associated_assessment_id`, `associated_resource_id`.
        *   **Validations**:
            *   Includes `prevent_incompatible_type_changes_if_member_activities_exist`: This validation restricts changing `activity_type` if `MemberActivity` records exist. It uses helper methods like `resource_based_type_change?` to determine if the change is between a resource-based type (video, pdf, workbook, ink) and an assessment type, or vice-versa. Such changes are disallowed to maintain data integrity and consistency of member experience.
            *   `prevent_associated_record_changes_if_member_activities_exist`: Prevents changing the `associated_record` if member activities exist, unless the change is for a resource-based type and the new record is also a resource.
            *   The `MILESTONE_COMPLETION_TYPES` constant (defined as `[:ink, :assessment]`) is used to validate that `required_for_milestone_completion` can only be true for these activity types.
        *   Scopes: `assessment_activities`, `required_activities`.
    *   **Response**: JSON object containing stats from `ComputeMemberStatsService` (e.g., `days_learning`, `resources_watched`, DTL skills).
    *   **Associated Service**: `ComputeMemberStatsService`.
    *   **Authorization**: `PlanPolicy#member_stats?`.

-   **`Objective`** (`objective.rb`)
    *   A specific instance of an objective within a `Milestone`.
    *   Inherits clonable attributes from `ObjectiveTemplate`.
    *   **Key Attributes**: `title` (presence validated), `description` (presence validated).
    *   **Associations**:
        *   `belongs_to :milestone`
        *   `belongs_to :objective_template` (optional)

-   **`Quote`** (`quote.rb`)
    *   A specific instance of a quote within a `Milestone`.
    *   Inherits clonable attributes from `QuoteTemplate`.
    *   **Key Attributes**: `content` (presence validated), `author_name` (presence validated).
    *   **Associations**:
        *   `belongs_to :milestone`
        *   `belongs_to :quote_template` (optional)
    *   **Other**: `has_one_attached :author_image`. Overrides `clone_attributes_from` to copy attached image.

-   **`PlanMember`** (`plan_member.rb`)
    *   Links a `User` (member) to a specific `Plan`. Represents enrollment.
    *   **Key Attributes**:
        *   `status` (Enum: `draft` (default), `processing`, `failed`, `published`, `started`, `completed`, presence validated)
        *   `status_updated_at` (Datetime)
    *   **Associations**:
        *   `belongs_to :plan` (`GuidedJourney::Plan`)
        *   `belongs_to :member` (`::User`)
        *   `has_many :member_milestones` (custom scoped and ordered)
    *   **Other**: Scopes: `for_member`, `active`. Callbacks to touch `status_updated_at`, broadcast status changes, and delete associated `member_milestones` on destroy.
        *   A `before_save` callback `touch_status_updated_at` updates the `status_updated_at` attribute to the current time if the `status` of the `PlanMember` record changes. This ensures `status_updated_at` accurately reflects the timestamp of the last status transition.

-   **`PlanCommunicationRule`** (`plan_communication_rule.rb`)
    *   **Purpose**: Allows defining rules for automated communications related to a `Plan` (e.g., reminders, notifications).
    *   **Key Attributes** (from schema, also listed in Section 3.2):
        *   `name` (String, presence validated): Name of the communication rule.
        *   `enabled` (Boolean, default: `true`): Whether the rule is active.
        *   `courier_template_key` (String, presence validated): Identifier for the Courier template to be used.
        *   `trigger_type` (String): Defines the event that triggers the communication.
        *   `trigger_offset_minutes` (Integer): Optional offset in minutes.
        *   `time_of_day_to_send` (Time): Optional specific time of day.
        *   `digest_day_of_week` (Integer): Optional day of the week for digests.
    *   **Associations**: `belongs_to :plan, class_name: 'GuidedJourney::Plan', foreign_key: :plan_uuid, optional: false`.
    *   **Functionality**: Provides the foundational model for automated plan-related communications. Specific logic for how different `trigger_type` values are processed, how `trigger_offset_minutes`, `time_of_day_to_send`, and `digest_day_of_week` interact, and how content is templated is handled by services and scheduled tasks (see Section 5). Factories and model specs exist.
    *   **Logging**: Communications sent via these rules are logged in the `CommunicationLog` model, which records the plan, triggering_rule, notifiable entity, user, and Courier template key. An administrative interface (`MemberCommunicationLog`) allows viewing and filtering these logs.
    *   **Schema**: `schema_metadata.yml` includes definitions for the `plan_communication_rules` table.

*(This section should be updated as the Plan Communication Rules feature matures, especially regarding the concrete `trigger_type` enum values and detailed operational logic of the dispatch mechanism.)*

-   **`PlanMemberImportConfig`** (`plan_member_import_config.rb`)
    *   Defines the configuration for the `ImportPlanMembersService` to bulk import or enroll members into a specific `Plan`.
    *   **Key Attributes**:
        *   `plan_uuid` (UUID): Foreign key to `guided_journey_plans.uuid`.
        *   `member_source_gids` (Array of Strings): Stores GlobalIDs of ActiveRecord objects (e.g., `Track`, `GroupCoachingSeries`) that serve as sources for members.
    *   **Associations**:
        *   `belongs_to :plan, class_name: 'GuidedJourney::Plan', foreign_key: :plan_uuid, inverse_of: :plan_member_import_config`
    *   **Validations**:
        *   A custom validation (`member_sources_contain_a_single_group_coaching_series`) ensures that `member_sources` cannot contain multiple `GroupCoachingSeries` records, nor can it mix `GroupCoachingSeries` with other source types like `Track`.
    *   **Methods**:
        *   `member_sources=(sources)`: Assigns an array of source objects (e.g., `Track`, `GroupCoachingSeries`), compacts them, and stores their GlobalIDs in the `member_source_gids` attribute.
        *   `member_sources`: Resolves the GlobalIDs stored in `member_source_gids` back into ActiveRecord objects, ignoring any missing records.
        *   Helper methods for ActiveAdmin forms (e.g., `member_sources_type`, `track_ids=`, `series_id=`) are present to facilitate UI for selecting member sources.
    *   **Other**: This configuration is utilized by the `ImportPlanMembersService` to manage the asynchronous enrollment of members. The `Plan` model `has_one :plan_member_import_config` and accepts nested attributes for it.

### 3.3. Member Layer Models

-   **`MemberMilestone`** (`member_milestone.rb`)
    *   Tracks a specific member's progress for a `Milestone`.
    *   Includes `AASM` for state management.
    *   **Key Attributes**:
        *   `status` (Enum: `locked` (initial AASM state), `unlocked`, `completed`, presence validated)
        *   `status_updated_at` (Datetime)
        *   `status_updated_by_uuid` (UUID, foreign key for `User`)
    *   **Delegates**: `name`, `description`, `milestone_type`, `position`, `due_at`, `optional` (to `milestone`).
    *   **Associations**:
        *   `belongs_to :member` (`User`)
        *   `belongs_to :milestone` (`GuidedJourney::Milestone`)
        *   `has_one :plan` (through `milestone`)
        *   `has_many :activities` (through `milestone`, scoped)
        *   `has_many :member_activities` (through `activities`, scoped)
        *   `belongs_to :status_updated_by` (`User`, optional)
    *   **Other**: Broadcasts on destroy. Scopes: `for_member`, `not_completed`, `not_locked`. AASM states/events (`unlock`, `complete`). Callbacks to touch `status_updated_at`, broadcast status changes (e.g., `guided_journey_member_milestone_unlocked`), and delete associated `member_activities` on destroy.

-   **`MemberActivity`** (`member_activity.rb`)
    *   Tracks a specific member's progress for an `Activity`.
    *   Includes `AASM` for state management.
    *   **Key Attributes**:
        *   `status` (Enum: `unlocked` (initial AASM state), `started`, `completed`, presence validated)
        *   `status_updated_at` (Datetime)
        *   `status_updated_by_uuid` (UUID, foreign key for `User`)
        *   `associated_record_uuid` (UUID, polymorphic, optional)
        *   `associated_record_type` (String, polymorphic, optional)
    *   **Delegates**: `title`, `description`, `activity_type`, `position`, `duration` (to `activity`). The `title` of an `activity.associated_record` (e.g. for a `Resource`) can be accessed via `member_activity.activity.associated_record.title`.
    *   **Associations**:
        *   `belongs_to :member` (`User`)
        *   `belongs_to :activity` (`GuidedJourney::Activity`)
        *   `belongs_to :associated_record` (polymorphic, optional)
        *   `belongs_to :status_updated_by` (`User`, optional)
        *   `has_one :milestone` (through `activity`)
        *   `has_one :plan` (through `milestone`)
        *   `has_one :member_milestone` (through `milestone`, scoped to member)
    *   **Other**: Scopes: `incomplete`, `required_activities`, `assessment_activities`, `not_assessment_activities`, `for_member`. AASM states/events (`start`, `complete`). Callbacks to touch `status_updated_at` and broadcast status changes (e.g., `guided_journey_member_activity_started`). `calculated_status` method to adjust status for session activities based on time.

*(Further details on model attributes, associations, and validations will be added by examining the model source code.)*

## 4. Key Services and Business Logic

The `README.md` and `ARCHITECTURE.md` highlight several key services.

### 4.1. Plan Creation, Publishing, and Member Enrollment

-   **Admin Plan Creation (from Template)** (Manual or via Admin UI):
    *   Typically involves an administrator cloning a `PlanTemplate` and its associated `MilestoneTemplate`s, `ActivityTemplate`s, etc., to create a new `Plan`.
    *   The `Plan` model's `init_milestones` callback handles cloning milestone structures from the template if a `plan_template` is provided on creation. This in turn triggers `Milestone` callbacks to clone activities, objectives, and quotes from their respective templates.

-   **`PublishPlanService`** (`publish_plan_service.rb`):
    *   **Input**: `plan` (GuidedJourney::Plan instance).
    *   **Validations**: Plan presence, start date in future, milestones present, series present (if session milestones exist), series session numbers match plan's session milestones.
    *   **Actions**:
        *   Sets `published_at` on the `Plan` to current time.
        *   If `plan.plan_member_import_config` exists, asynchronously calls `ImportPlanMembersService` (queued for `within_5_minutes`).

-   **`ImportPlanMembersService`** (`import_plan_members_service.rb`):
    *   **Input**: `config` (GuidedJourney::PlanMemberImportConfig instance).
    *   **Purpose**: Enrolls a large number of members based on `member_sources` (e.g., `GroupCoachingSeries`, `Track`) defined in the `config`.
    *   **Validations**: Plan presence, referenced Tracks must be active.
    *   **Actions**:
        *   Fetches eligible members from each source in batches.
        *   For each batch, asynchronously calls `EnrollMemberService.call_async_bulk` (queued for `within_1_hour`).
    *   **Output**: Total number of members for whom enrollment was initiated.

-   **`EnrollMemberService`** (`enroll_member_service.rb`):
    *   **Input**: `plan`, `member`.
    *   **Actions**:
        *   Finds or creates a `PlanMember` record.
        *   If the `plan` is published and `PlanMember` is `publishable?` (status `draft` or `failed`), asynchronously calls `PublishPlanMemberService` (queued for `within_1_hour`).
    *   **Output**: The `PlanMember` instance.

-   **`PublishPlanMemberService`** (`publish_plan_member_service.rb`):
    *   **Input**: `plan_member`.
    *   **Purpose**: Finalizes the enrollment of a single member into a plan, creating their specific milestones and activities.
    *   **Actions** (within a transaction):
        *   Updates `plan_member.status` to `:processing`, then to `:published`.
        *   For each `Milestone` in the `plan`:
            *   Creates a `MemberMilestone` for the member (status from `milestone.member_default_status`).
            *   For each `Activity` in the `Milestone`, calls `CreateMemberActivityService`.
    *   Handles errors by setting `plan_member.status` to `:failed`.
    *   **Output**: The `PlanMember` instance.

-   **`CreateMemberActivityService`** (`create_member_activity_service.rb`):
    *   **Input**: `activity_uuid`, `member_uuid`.
    *   **Actions**:
        *   Finds or initializes a `MemberActivity`.
        *   Sets its `associated_record` from the parent `Activity` (unless it's an assessment activity, where the `associated_record` on `MemberActivity` might be linked to a specific member assessment instance created by `StartMemberActivityService`). For other types like PDF or video, it would typically clone the `associated_record_uuid` and `associated_record_type` from the parent `Activity`.
        *   Saves the `MemberActivity`.
    *   **Output**: The `MemberActivity` instance.

-   **`CreateMemberMilestoneService`** (`create_member_milestone_service.rb`):
    *   **Input**: `milestone_uuid`, `member_uuid`.
    *   **Purpose**: Creates a single `MemberMilestone` for a given milestone and member, or finds the existing one.
    *   **Actions**:
        *   Finds or initializes a `MemberMilestone`.
        *   If new, sets status from `milestone.member_default_status`.
        *   Saves the `MemberMilestone`.
    *   **Output**: The `MemberMilestone` instance.
    *   *Note: This service provides a direct way to create/ensure a `MemberMilestone`. The main enrollment flow via `PublishPlanMemberService` creates `MemberMilestone`s directly within its transaction. After initial statuses are set by `PublishPlanMemberService`, any further unlocking (even for the first milestones, if not set to `unlocked` by `member_default_status` and meeting conditions) would be handled by `UnlockNextMilestoneForMemberService`.*

### 4.2. Member Progress

-   **`StartMemberActivityService`** (`start_member_activity_service.rb`):
    *   **Input**: `member_activity`, `actor` (User), `session_data` (optional).
    *   **Purpose**: Transitions a `MemberActivity` to the `started` state.
    *   **Validations**: Inputs present. `MemberActivity` must be `unlocked` (checked via `calculated_status` which considers session start times). `session_data` required for session activities.
    *   **Actions** (transactional):
        *   Updates `member_activity.status` to `:started`, sets `status_updated_by`.
        *   If it's an assessment activity without an existing `associated_record`, calls `Assessments::Services::CreateByAssessmentConfiguration` to create and link an assessment instance.
    *   **Output**: The `MemberActivity` instance.

-   **`CompleteMemberActivityService`** (`complete_member_activity_service.rb`):
    *   **Input**: `actor`, `activity`, `member` (also uses/finds `member_activity`).
    *   **Purpose**: Transitions a `MemberActivity` to `completed`.
    *   **Actions** (transactional, if not already completed):
        *   Updates `member_activity.status` to `:completed`, sets `status_updated_by`.
        *   Calls `CompleteMemberMilestoneService` for the parent milestone.
    *   **Output**: The `MemberActivity` instance.

-   **`CompleteMemberMilestoneService`** (`complete_member_milestone_service.rb`):
    *   **Input**: `actor`, `milestone`, `member`, `bypass_completion_of_activities` (boolean, default `false`).
    *   **Purpose**: Transitions a `MemberMilestone` to `completed`.
    *   **Validations**: Inputs present. `MemberMilestone` must exist and not be `locked`.
    *   **Actions** (transactional, if not already completed and requirements met):
        *   Returns if `bypass_completion_of_activities` is false and incomplete required activities exist for the milestone (i.e., `MemberActivity` records linked to the `MemberMilestone` where the parent `Activity.required_for_milestone_completion` is true (e.g. for `ink` or `assessment` types), and `MemberActivity.status` is not `completed`).
        *   Updates `member_milestone.status` to `:completed`, sets `status_updated_by`.
        *   Calls `UnlockNextMilestoneForMemberService`.
    *   **Output**: The `MemberMilestone` instance.

-   **`UnlockNextMilestoneForMemberService`** (`unlock_next_milestone_for_member_service.rb`):
    *   **Input**: `actor`, `plan`, `member`.
    *   **Purpose**: Unlocks subsequent `MemberMilestone`s for a member based on the plan's unlocking strategy.
    *   **Invocation**: This service is primarily called after a member completes a milestone (via `CompleteMemberMilestoneService`). It can also be invoked by system processes, such as a scheduled job checking for time-based unlocks (see Section 5).
    *   **Validations**: Inputs present. Member must be enrolled in the plan.
    *   **Actions** (transactional):
        *   Iterates through ordered `MemberMilestone`s for the member in the plan.
        *   If a `MemberMilestone` is `locked` and meets unlock criteria, it's unlocked via `member_milestone.unlock!(actor)`. The unlock criteria depend on `plan.milestone_unlocking_strategy`:
            *   **`by_completion`**: Unlocks if all preceding *required* `MemberMilestone`s for the member are `completed`. The `milestone.unlock_at` date is ignored (i.e., `nil` or a set date has no effect on this strategy).
            *   **`by_completion_or_unlock_at_time`** (Default strategy): Unlocks if *either* all preceding *required* `MemberMilestone`s are `completed` *or* (`milestone.unlock_at` is present AND `milestone.unlock_at` has passed). If `milestone.unlock_at` is `nil` (not present), this strategy effectively behaves like `by_completion`.
            *   **`by_completion_and_unlock_at_time`**: Unlocks *only when both* (all preceding *required* `MemberMilestone`s are `completed`) *and* (`milestone.unlock_at` is present AND `milestone.unlock_at` has passed). If `milestone.unlock_at` is `nil` (not present), the time-based condition cannot be met, so the milestone will **not** unlock under this strategy, even if prerequisites are met. (Note: `Plan.requires_unlock_dates?` validates that `milestone.unlock_at` must be set for plans using this strategy).
            *   **`by_unlock_at_time`**: Unlocks *only when* (`milestone.unlock_at` is present AND `milestone.unlock_at` has passed). Completion status of preceding milestones is ignored. If `milestone.unlock_at` is `nil` (not present), the milestone will **not** unlock under this strategy. (Note: `Plan.requires_unlock_dates?` validates that `milestone.unlock_at` must be set for plans using this strategy).
        *   Optional milestones are typically ignored when checking prerequisites for unlocking subsequent required milestones. Their own unlock is usually predicated on the completion of the preceding required milestone and their own `unlock_at` if applicable.

-   **`CompletePlanMemberService`** (`complete_plan_member_service.rb`):
    *   **Input**: `plan`, `member`.
    *   **Purpose**: Transitions a `PlanMember`'s status to `completed`.
    *   **Validations**: Inputs present. Member must be enrolled in the plan.
    *   **Actions**:
        *   If `PlanMember` status is `started` and all non-optional `MemberMilestone`s (where `milestone.optional` is false) are `completed` for the member in that plan, updates `PlanMember.status` to `:completed`.

-   **`StartPlanMemberService`** (`start_plan_member_service.rb`):
    *   **Input**: `plan_member`.
    *   **Purpose**: Transitions a `PlanMember` from `published` to `started` status if the plan has started.
    *   **Actions**:
        *   If `plan_member` is `published`, its `plan` is `published`, and `plan` has `started?`, updates `plan_member.status` to `:started` (with lock).
    *   **Output**: The `PlanMember` instance.

-   **`StartPlanService`** (`start_plan_service.rb`):
    *   **Input**: `plan`, `starts_at` (timestamp, defaults to `plan.starts_at`).
    *   **Purpose**: Intended to be called when a plan officially starts (e.g., by a scheduler). It initiates the `started` status for all published members of the plan.
    *   **Actions**:
        *   If `plan` is `published` and `started?`, and `plan.starts_at` matches the input `starts_at`:
            *   Fetches all `published` `PlanMember`s in batches.
            *   For each batch, asynchronously calls `StartPlanMemberService.call_async_bulk`.

### 4.3. Administrative Overrides and Actions

Administrative actions, typically invoked via an admin interface, allow for manual intervention in member progression. These often involve directly calling services or AASM state transition methods on member-specific records.

-   **Manual Milestone Unlocking**:
    *   An administrator can unlock a specific `MemberMilestone` for a member.
    *   **Technical Implementation**: This would typically involve fetching the `MemberMilestone` instance and calling `member_milestone.unlock!(admin_user)`. This bypasses standard prerequisite checks and `unlock_at` date restrictions for that specific instance.
-   **Manual Milestone Completion**:
    *   An administrator can mark a specific `MemberMilestone` as `completed`.
    *   **Technical Implementation**: This usually involves calling the `CompleteMemberMilestoneService` with the `bypass_completion_of_activities` flag set to `true` if needed, or directly calling `member_milestone.complete!(admin_user)` after ensuring any necessary conditions are met or bypassed. This action will then trigger the `UnlockNextMilestoneForMemberService` for the member.
-   **Manual Activity Completion**:
    *   An administrator can mark a specific `MemberActivity` as `completed`.
    *   **Technical Implementation**: This would involve fetching the `MemberActivity` instance and calling `member_activity.complete!(admin_user)`. This subsequently calls `CompleteMemberMilestoneService` for the parent milestone if all required activities for that milestone (including `ink` or `assessment` types) are now complete.

### 4.4. Frontend Logic Highlights

While this document primarily focuses on backend architecture, key frontend logic components are crucial for the member experience:

-   **Auto-Redirection Engine**: Responsible for navigating the member to the most relevant milestone upon visiting their plan page. This engine evaluates milestones based on a defined priority list (from `PRODUCT_OVERVIEW.md` Section 3.1):
    1.  **First Unlocked Required Milestone**: Earliest `Milestone` (`position`) that is required (`optional: false`), `unlocked`, and not `completed`.
    2.  **First Unlocked Optional Milestone**: If no required milestones match, earliest `Milestone` that is optional (`optional: true`), `unlocked`, and not `completed`.
    3.  **Last Completed Milestone**: If no milestones are currently `unlocked`, the last `Milestone` the member `completed`.
    4.  **First Milestone in Plan (Fallback)**: The very first `Milestone` (`position: 1`) in the plan.
-   **Milestone Validity Check**: Before rendering a milestone page (even if targeted by the redirection engine or a direct link), a frontend check ensures the `MemberMilestone.status` for the current member is **not** `locked`. If it is `locked`, the direct navigation is prevented, and the full auto-redirection process (described above) is re-initiated to find a suitable, accessible milestone.
-   **Component Styling**: Recent updates to frontend components (e.g., `ActivityItem.tsx`) include changes to background colors and other styles to better reflect the status of items (e.g., unlocked, started, completed), aiming for clearer visual cues for the member. Copy updates for DTL coaching information have also been implemented in components like `HeaderMilestoneItem.tsx`.
-   **Activity Handling**:
    *   **Ink Activities (`ActivityInk.tsx`)**: The `ActivityInk.tsx` component handles rendering Ink interactive activities. It uses the `@betterup/ink-app` library. Upon `onFlowEnd` from Ink, it calls the `useCompleteActivity` hook, which in turn likely triggers the `POST /guided_journey/activities/:id/complete` backend endpoint to mark the `MemberActivity` as completed.
    *   **Activity Modals (`ActivityModal.tsx`, `ActivityVideo.tsx`)**: General modal structure for activities like `video` and `ink`, often lazy-loading the specific activity components.
    *   **Activity Item Display (`ActivityItem.tsx`)**: Manages UI for various activity types, including displaying the formatted `duration`.
-   **Plan Completion Celebration Overlay (`PlanCompletionOverlay.tsx`)**:
    *   A new frontend component responsible for displaying a celebration overlay when a plan is completed.
    *   **Triggering**: Managed by the `usePlanCompletionOverlay` hook in `GuidedJourneyPage.tsx`. It shows if `plan.celebration_overlay_enabled` is true, the plan was recently completed, and the overlay hasn't been shown before (tracked via `localStorage`).
    *   **Data Fetching**: Uses the `usePlanMemberStats.ts` hook, which calls the `GET /guided_journey/plans/:id/member_stats` endpoint to retrieve statistics for display. For more on the overlay's purpose and content, see `PRODUCT_OVERVIEW.md` Section 7.7.

*(This section will be expanded with more details on service responsibilities, inputs, outputs, and interactions after reviewing service object source code.)*

## 5. System-Initiated Actions & Scheduled Tasks

Beyond direct user or administrator interactions, several processes in the Guided Journey system are designed to be initiated automatically by the system, often via scheduled tasks or background jobs.

-   **Time-Based Milestone Unlocking**:
    *   **Purpose**: To unlock milestones for members when a pre-configured `milestone.unlock_at` date/time is reached, independently of immediate preceding milestone completion by the member (especially relevant for `by_unlock_at_only` and `by_unlock_at_or_completion` strategies).
    *   **Mechanism**: A recurring scheduled job (e.g., running hourly or daily) is expected to:
        1.  Query for `MemberMilestone` records that are currently `locked` but whose parent `Milestone` has an `unlock_at` time that has passed.
        2.  For each eligible `MemberMilestone`, consider the `Plan.milestone_unlocking_strategy`.
        3.  Invoke the `UnlockNextMilestoneForMemberService` (or a specialized variant) for the affected `plan` and `member`, passing a system actor, to evaluate and perform the unlock if all conditions for the strategy are met.
    *   This ensures that time-released content becomes available without requiring manual intervention or specific member actions to trigger a check.

-   **Plan Activation (`StartPlanService`)**:
    *   **Purpose**: To formally start a `Plan` when its `starts_at` date and time are reached.
    *   **Mechanism**: The `StartPlanService` is designed to be invoked by a system scheduler. When triggered for a given plan, it transitions the status of all `published` `PlanMember`s to `started`, enabling them to begin their journey.

-   **Automated Communications Dispatch (via `PlanCommunicationRule`)**:
    *   **Purpose**: To send automated communications (e.g., reminders, notifications, congratulations) to members based on their progress or other events within a plan, as defined by `PlanCommunicationRule`s.
    *   **Mechanism**: A scheduled job would likely run periodically to:
        1.  Evaluate active `PlanCommunicationRule`s against the current state of `PlanMember`s, `MemberMilestone`s, and `MemberActivity`s.
        2.  Identify members who meet the criteria for a specific communication rule.
        3.  Trigger the dispatch of the configured communication (e.g., sending an email or creating an in-app notification) via an appropriate notification service, logging this in `CommunicationLog`.

-   **Background Job Infrastructure**:
    *   **Purpose**: To handle asynchronous execution of services that may be long-running or need to be processed outside the main request-response cycle (e.g., bulk member enrollment, processing plan publishing steps).
    *   **Mechanism**: The system relies on a background job processing framework (e.g., Sidekiq, Resque, or a platform-specific equivalent). Services like `ImportPlanMembersService`, `EnrollMemberService.call_async_bulk`, `PublishPlanMemberService`, and `StartPlanMemberService.call_async_bulk` are enqueued for asynchronous execution by this framework, as noted by phrases like "queued for `within_X_minutes/hours`" in their descriptions.

## 6. API Endpoints

The Guided Journey pack exposes several API endpoints, primarily under the `/guided_journey/` namespace. These are used by the frontend to manage member progression and display plan information. Authentication and authorization are handled by the standard application mechanisms (e.g., `ApplicationController`, Pundit policies).

-   **Get Plan Details and Member Progress**:
    *   **Endpoint**: `GET /guided_journey/plans/:id`
    *   **Controller**: `GuidedJourney::PlansController#show`
    *   **Purpose**: Fetches the details of a specific `Plan` (`published` and `past` its `starts_at` time) along with the current member's progress (milestone and activity statuses).
    *   **Response**: JSON representation of the `Plan` (via `PlanSerializer`), including nested `MemberMilestone` and `MemberActivity` data for the current user.
    *   **Authorization**: `PlanPolicy#show?` (ensures member is enrolled or admin).

-   **Get Milestone Details**:
    *   **Endpoint**: `GET /guided_journey/milestones/:id`
    *   **Controller**: `GuidedJourney::MilestonesController#show`
    *   **Purpose**: Fetches details for a specific `Milestone`. (Primarily used for rendering individual milestone views).
    *   **Response**: JSON representation of the `Milestone`.
    *   **Authorization**: Likely `MilestonePolicy#show?`.

-   **Open (Start) Member Activity**:
    *   **Endpoint**: `POST /guided_journey/activities/:id/open` (where `:id` is `Activity` UUID)
    *   **Controller**: `GuidedJourney::ActivitiesController#open`
    *   **Purpose**: Marks a `MemberActivity` as `started` for the current member.
    *   **Request**: May implicitly use `session_data` for session activities.
    *   **Response**: Updated `MemberActivity` resource (via `MemberActivityContentSerializer`).
    *   **Associated Service**: `StartMemberActivityService`.
    *   **Authorization**: Controller ensures member has access to the activity.

-   **Complete Member Activity (Ink Specific)**:
    *   **Endpoint**: `POST /guided_journey/activities/:id/complete` (where `:id` is `Activity` UUID)
    *   **Controller**: `GuidedJourney::ActivitiesController#complete`
    *   **Purpose**: Marks a `MemberActivity` of type `ink` as `completed` for the current member. This endpoint is specifically for Ink activities; other activity types are completed via different mechanisms (e.g., assessment engine callbacks, admin actions).
    *   **Response**: Updated `MemberActivity` resource (via `MemberActivityContentSerializer`).
    *   **Associated Service**: `CompleteMemberActivityService`.
    *   **Authorization**: Controller ensures activity is `ink` type and member has access.

-   **Get Member Stats for a Plan**:
    *   **Endpoint**: `GET /guided_journey/plans/:id/member_stats`
    *   **Controller**: `GuidedJourney::PlansController#member_stats`
    *   **Purpose**: Fetches member-specific statistics for a given plan, primarily used by the Plan Completion Overlay feature.
    *   **Response**: JSON object containing three keys: `:stats` (Array of Hashes with `label` and `amount`), `:skills` (Array of Strings), and `:image_path` (String). The content is generated by `ComputeMemberStatsService`.
    *   **Associated Service**: `ComputeMemberStatsService`.
    *   **Authorization**: `PlanPolicy#member_stats?`.

-   **Get Plan Completion Certificate**:
    *   **Endpoint**: `GET /guided_journey/plans/:plan_id/certificate`
    *   **Controller**: `GuidedJourney::CertificatesController#show`
    *   **Purpose**: Allows a member to download their completion certificate for a plan (typically in PDF format).
    *   **Logic**: 
        *   Finds the `PlanMember` for the `current_user` and `plan_id`.
        *   Authorizes via `PlanPolicy` (`show?` action on the plan).
        *   Checks `plan.has_completion_certificate?` and `plan_member.completed?`.
        *   Attempts to fetch `facilitator_name` using `GroupCoachingCohortsApi.coach_details_of(member_id, plan.series_id)`.
        *   Calls `plan.completion_certificate_pdf` with member name, completion date (from `plan_member.updated_at`), and facilitator name.
        *   Sends the rendered PDF data as `application/pdf`.
    *   **Response**: PDF file.
    *   **Authorization**: Controller uses `authorize @plan` (effectively `PlanPolicy#show?`). Ensures member is enrolled and plan is accessible. Access to certificate content itself is gated by `certificate_available?` check.

-   **Administrative Actions (Not typically direct API endpoints for clients)**:
    *   Actions like manually unlocking or completing milestones/activities for a member are generally performed via administrative interfaces (e.g., ActiveAdmin). These interfaces call backend services directly (e.g., `Admin::UpdateMemberMilestoneStatusService`, `CompleteMemberMilestoneService` with bypass flags) rather than exposing dedicated, general-purpose API endpoints for these sensitive operations.

*(This list is based on current route definitions and controller analysis. Further details on request/response formats for all endpoints would require deeper inspection of serializers and service responses.)*

## 7. Integrations

Integrations with other internal and external services enhance the functionality of the Guided Journey system.

-   **Ink Interactive Activities**:
    *   **Integration Point**: Ink activities are launched from the member's journey. Completion is reported back to the Guided Journey system.
    *   **Mechanism**: As described in Section 6 (API Endpoints), the Ink application uses a dedicated API endpoint to signal completion, typically triggered by an `onFlowEnd` event within the Ink experience. This updates the `MemberActivity` status.
-   **Assessment Engine**:
    *   **Integration Point**: Assessment-type activities link to `AssessmentConfiguration` records.
    *   **Mechanism**:
        *   **Starting an Assessment**: The `StartMemberActivityService` calls `Assessments::Services::CreateByAssessmentConfiguration` when an assessment activity is started by a member. This service creates and links an actual assessment instance (e.g., an `Assessment` record) to the `MemberActivity`'s `associated_record`.
        *   **Completing an Assessment**: The Guided Journey system uses a listener pattern. The `GuidedJourney::CompleteMemberActivityListener` listens for an `assessment_submitted` event (likely broadcast via Wisper when an `Assessment` record is submitted).
            *   Upon receiving this event, the listener's `assessment_submitted(assessment)` method is called.
            *   It finds the relevant `MemberActivity` by looking for one associated with the submitted `assessment` record and the `assessment.user`.
            *   If found, it calls `CompleteMemberActivityService` to mark that `MemberActivity` as `completed`.

-   **"Today Item" Dashboard Integration**:
    *   **Purpose**: To highlight active Guided Journey plans on a central member dashboard.
    *   **Mechanism**: The Guided Journey pack provides a specific `TodayItem` model: `GuidedJourney::TodayItems::GuidedJourneyTodayItem`.
        *   A central `TodayItemService` (likely in `packs/member_home/`) iterates through various `TodayItem` sources, including this one.
        *   `GuidedJourneyTodayItem.for_user(user, limit:)` is called by the central service.
            *   This method currently checks if the user has the `dare_to_lead_guided_journey?` feature status. If not, it returns no items. (TODO: Note in code mentions limiting to DTL for now).
            *   If the feature is active, it uses `GuidedJourney::FetchMemberPlansService` to get `PlanMember` records for the user with a `started` status.
        *   The `GuidedJourneyTodayItem#initialize(member_plan, user)` constructor then formats the `PlanMember` data into a `TodayItem` structure, setting attributes like title, description, image (with DTL-specific variants), and a call-to-action URL pointing to `FrontendUrlHelper.platform_guided_journey_plan_path(member_plan.plan_uuid)`.
    *   This integration relies on the Guided Journey pack defining its own `TodayItem` subclass rather than exposing a generic API for an external service to consume.

## 8. Other Key Services and Rules

-   **`PlanCommunicationRule`** (`plan_communication_rule.rb`)
    *   **Purpose**: Allows defining rules for automated communications related to a `Plan` (e.g., reminders, notifications).
    *   **Key Attributes** (from schema, also listed in Section 3.2):
        *   `name` (String, presence validated): Name of the communication rule.
        *   `enabled` (Boolean, default: `true`): Whether the rule is active.
        *   `courier_template_key` (String, presence validated): Identifier for the Courier template to be used.
        *   `trigger_type` (String): Defines the event that triggers the communication.
        *   `trigger_offset_minutes` (Integer): Optional offset in minutes.
        *   `time_of_day_to_send` (Time): Optional specific time of day.
        *   `digest_day_of_week` (Integer): Optional day of the week for digests.
    *   **Associations**: `belongs_to :plan, class_name: 'GuidedJourney::Plan', foreign_key: :plan_uuid, optional: false`.
    *   **Functionality**: Provides the foundational model for automated plan-related communications. Specific logic for how different `trigger_type` values are processed, how `trigger_offset_minutes`, `time_of_day_to_send`, and `digest_day_of_week` interact, and how content is templated is handled by services and scheduled tasks (see Section 5). Factories and model specs exist.
    *   **Logging**: Communications sent via these rules are logged in the `CommunicationLog` model, which records the plan, triggering_rule, notifiable entity, user, and Courier template key. An administrative interface (`MemberCommunicationLog`) allows viewing and filtering these logs.
    *   **Schema**: `schema_metadata.yml` includes definitions for the `plan_communication_rules` table.

*(This section should be updated as the Plan Communication Rules feature matures, especially regarding the concrete `trigger_type` enum values and detailed operational logic of the dispatch mechanism.)*

-   **`PlanMemberImportConfig`** (`plan_member_import_config.rb`)
    *   Defines the configuration for the `ImportPlanMembersService` to bulk import or enroll members into a specific `Plan`.
    *   **Key Attributes**:
        *   `plan_uuid` (UUID): Foreign key to `guided_journey_plans.uuid`.
        *   `member_source_gids` (Array of Strings): Stores GlobalIDs of ActiveRecord objects (e.g., `Track`, `GroupCoachingSeries`) that serve as sources for members.
    *   **Associations**:
        *   `belongs_to :plan, class_name: 'GuidedJourney::Plan', foreign_key: :plan_uuid, inverse_of: :plan_member_import_config`
    *   **Validations**:
        *   A custom validation (`member_sources_contain_a_single_group_coaching_series`) ensures that `member_sources` cannot contain multiple `GroupCoachingSeries` records, nor can it mix `GroupCoachingSeries` with other source types like `Track`.
    *   **Methods**:
        *   `member_sources=(sources)`: Assigns an array of source objects (e.g., `Track`, `GroupCoachingSeries`), compacts them, and stores their GlobalIDs in the `member_source_gids` attribute.
        *   `member_sources`: Resolves the GlobalIDs stored in `member_source_gids` back into ActiveRecord objects, ignoring any missing records.
        *   Helper methods for ActiveAdmin forms (e.g., `member_sources_type`, `track_ids=`, `series_id=`) are present to facilitate UI for selecting member sources.
    *   **Other**: This configuration is utilized by the `ImportPlanMembersService` to manage the asynchronous enrollment of members. The `Plan` model `has_one :plan_member_import_config` and accepts nested attributes for it.

-   **`CommunicationLog`** (`communication_log.rb`)
    *   **Purpose**: Records a history of automated communications sent via `PlanCommunicationRule`s.
    *   **Key Attributes**:
        *   `plan_uuid` (UUID): Foreign key to the `Plan`.
        *   `triggering_rule_uuid` (UUID): Foreign key to the `PlanCommunicationRule`.
        *   `notifiable_type`, `notifiable_uuid`: Polymorphic association to the record that triggered the notification (e.g., `PlanMember`).
        *   `user_uuid` (UUID): Foreign key to the `User` who received the communication.
        *   `courier_template_key` (String): The key of the Courier template that was used.
    *   **Associations**: `belongs_to :plan`, `belongs_to :triggering_rule` (`PlanCommunicationRule`), `belongs_to :notifiable` (polymorphic), `belongs_to :user`.
    *   **Admin Interface**: A corresponding `Admin::CommunicationLog` resource allows viewing and filtering these logs.

*(Further details on model attributes, associations, and validations will be added by examining the model source code.)*

## 4. Key Services and Business Logic

The `README.md` and `ARCHITECTURE.md` highlight several key services.

### 4.1. Progression and Unlocking
- **`CompleteMemberMilestoneService`**: Handles marking a `MemberMilestone` as completed. It validates that the milestone isn't locked and, crucially, checks if all *required activities* (those with `Activity.required_for_milestone_completion = true`, e.g., `ink` or `assessment` types) within that milestone are completed by the member (via `member_milestone.member_activities.required_activities.incomplete.exists?`), unless `bypass_completion_of_activities` is true. Upon completion, it invokes `UnlockNextMilestoneForMemberService` and `CompletePlanMemberService`.
- **`UnlockNextMilestoneForMemberService`**: (Assumed, not in changed files) This service is responsible for determining the next milestone to unlock for a member, considering the plan's `milestone_unlocking_strategy` and the `optional` status of milestones. It needs to correctly identify the next *required* milestone if optional ones are skipped or completed.
- **`CompletePlanMemberService`**: (Assumed, not in changed files) This service evaluates if the overall plan is completed for a member. This logic must correctly factor in `Milestone.optional` flags, ensuring only the completion of all *required* milestones leads to plan completion.
- **`Admin::UpdateMemberMilestoneStatusService`**: Allows an administrator to directly change a `MemberMilestone.status`. If the status is changed to `completed`, it also calls `UnlockNextMilestoneForMemberService` and `CompletePlanMemberService`, bypassing the usual required activity checks.

### 4.2. Frontend Activity Handling
- **Ink Activities (`ActivityInk.tsx`)**: The `ActivityInk.tsx` component handles rendering Ink interactive activities. It uses the `@betterup/ink-app` library. Upon `onFlowEnd` from Ink, it calls the `useCompleteActivity` hook, which in turn likely triggers the `POST /guided_journey/activities/:id/complete` backend endpoint to mark the `MemberActivity` as completed.
- **Video Activities**: Also utilize a modal (`ActivityVideo.tsx`) for display, managed by `ActivityModal.tsx`.
- **`useOpenActivity` Hook**: Called when an activity is opened by the member, potentially to update its status to `started` on the backend via `POST /guided_journey/activities/:id/open`.
- **Activity Item Display (`ActivityItem.tsx`)**: Manages UI for various activity types, including displaying the formatted `duration`.

### 4.3. Plan Completion Celebration Overlay
This feature provides a celebratory overlay upon plan completion. For a product-level description, see `PRODUCT_OVERVIEW.md` Section 7.7. The technical implementation spans from the backend data model to frontend components.

-   **1. Backend Configuration**: The feature is enabled for a `Plan` when an administrator sets its `completion_certificate_template` attribute to `'dare_to_lead'`.
-   **2. API Serialization (`PlanSerializer`)**: When a `Plan` is serialized for the frontend, the `celebration_overlay_enabled` attribute is dynamically set to `true` if `plan.completion_certificate_template == 'dare_to_lead'`. This boolean flag is sent to the frontend as part of the `Plan` object.
-   **3. Frontend Trigger (`usePlanCompletionOverlay` hook)**: Inside `GuidedJourneyPage.tsx`, the `usePlanCompletionOverlay` custom hook determines if the overlay should be displayed. It combines several conditions:
    *   `plan.celebration_overlay_enabled` must be `true`.
    *   `plan.status` must be `'completed'`.
    *   The plan must have been completed recently (within the last 3 days).
    *   A flag in `localStorage` (`plan-completion-overlay-shown-${plan.id}`) is checked to ensure the overlay is only shown once per user per plan completion.
-   **4. Statistics Fetching (`usePlanMemberStats` hook)**: If the overlay is to be shown, the `PlanCompletionOverlay.tsx` component is rendered. It uses the `usePlanMemberStats` hook to call the `GET /guided_journey/plans/:id/member_stats` endpoint to fetch the dynamic data required for display.
-   **5. Statistics Calculation (`ComputeMemberStatsService`)**: On the backend, this service calculates the stats for the member, including `days_learning`, `resources_watched`, and the total `session_milestone_count`. It also provides the hardcoded DTL-specific skills list and badge image path. See Section 8 for a detailed breakdown of this service.
-   **6. Frontend Rendering (`PlanCompletionOverlay.tsx`)**: The component receives the stats from the API and renders the final overlay with the plan name, skills, badge, and dynamic statistics. When the user closes the overlay, the `localStorage` flag is set to prevent it from showing again.

### 4.4. Automated Communications on Plan Completion
The system can send automated communications when a member completes a plan. This is handled by an event-driven flow.

-   **1. Event Trigger**: When a `PlanMember`'s status is successfully changed to `completed` (typically via the `CompletePlanMemberService`), a `guided_journey_plan_member_completed` event is broadcast using `Wisper`.
-   **2. Event Listener (`MemberPlanBusinessEventsListener`)**: This listener is subscribed to the `guided_journey_plan_member_completed` event. Upon receiving the event, its `guided_journey_plan_member_completed` method is invoked.
-   **3. Processing Service (`ProcessEndOfPlanCommunicationService`)**: The listener calls `ProcessEndOfPlanCommunicationService.call(plan_member: plan_member)`. This service is responsible for handling the logic for all `end_of_plan` communications.
-   **4. Rule Execution**: The service checks if `plan.communications_enabled?` is `true`. If so, it queries for all enabled `PlanCommunicationRule`s on that plan where the `trigger_type` is `end_of_plan`.
-   **5. Notification and Logging**: For each matching rule, the service performs two key actions:
    *   **Creates a `CommunicationLog` record**: This logs that the communication was triggered for the specific rule and member.
    *   **Creates a `PlanCompletionNotification`**: This is a `Noticed::Base` notification that is delivered asynchronously. It contains the `courier_template_id` from the rule, which tells the Courier service which email template to send.

## 5. Admin Interface

Key administrative configurations and views include:
-   **Activity and ActivityTemplate Forms (`admin/activities.rb`, `admin/activity_templates.rb`)**:
    *   Allow setting the `duration` (in minutes) for activities and templates.
    *   The `activity_type` dropdown now includes `ink` and uses `ActivityTemplate.activity_types.keys` for templates.
    *   Form logic for `activity_type` and `associated_record` is improved when member activities exist, including deletion warnings for assessments.
    *   New UUID-based filters may be present.
-   **Milestone Form (`admin/milestones.rb`)**:
    *   Allows setting the `optional` (Boolean) flag for milestones (checkbox in the form).
    *   The `duration_in_days` attribute for overall milestone pacing is also managed here.
    *   The activities table on the milestone show page now displays activity `duration`.
    *   The show page displays the `optional` status of the milestone.
    *   Enhanced warnings for editing published plans.
-   **Plan Form (`admin/plans.rb`)**: Admins set the `completion_certificate_template`. There is no direct admin toggle for `celebration_overlay_enabled` as it's derived from the certificate template choice (see `PlanSerializer` logic in Section 3.2).
-   **Milestone Statistics Page (`admin/milestones.rb` -> `stats` member_action)**: A new view available to administrators that displays detailed statistics for each milestone, including counts of member milestones by status (locked, unlocked, completed) and completion rates. It also shows status counts for each activity within that milestone.
-   **`PlanCommunicationRule`** (`plan_communication_rule.rb`)
    *   **Purpose**: Allows defining rules for automated communications related to a `Plan` (e.g., reminders, notifications).
    *   **Key Attributes**:
        *   `name` (String, presence validated): Name of the communication rule.
        *   `enabled` (Boolean, default: `true`): Whether the rule is active.
        *   `courier_template_key` (String, presence validated): Identifier for the Courier template to be used.
        *   `trigger_type` (Enum, `end_of_plan`): Defines the event that triggers the communication. Currently, only `end_of_plan` is implemented.
    *   **Associations**: `belongs_to :plan`.
    *   **Functionality**: Provides the foundational model for automated plan-related communications. The `ProcessEndOfPlanCommunicationService` handles the execution of these rules upon the `guided_journey_plan_member_completed` event.
    *   **Logging**: Communications sent via these rules are logged in the `CommunicationLog` model. An administrative interface (`Admin::CommunicationLog`) allows viewing these logs.

*(This section should be updated as the Plan Communication Rules feature matures, especially regarding the concrete `trigger_type` enum values and detailed operational logic of the dispatch mechanism.)*

-   **`ComputeMemberStatsService`** (`compute_member_stats_service.rb`)
    *   **Input**: `plan` (GuidedJourney::Plan instance), `user` (User instance).
    *   **Purpose**: Calculates and aggregates statistics regarding a specific member's engagement and progression within a given plan. Also provides a list of relevant skills associated with the plan context (e.g., DTL skills).
    *   **Validations**: Presence of both `plan` and `user`.
    *   **Actions**:
        *   Queries `PlanMember`, `MemberMilestone`, and `MemberActivity` records associated with the input `plan` and `user`.
        *   Calculates various metrics:
            *   `days_learning`: Number of calendar days from `plan.starts_at` to the completion date (`plan_member.status_updated_at`), rounded up to the nearest whole day. Calculated as `((end_date - plan.starts_at) / 1.day).ceil`, where `end_date` is the completion timestamp or `Time.current`.
            *   `resources_watched`: Count of 'video' type `MemberActivity` records for the user in the plan that are in `completed` or `started` status.
            *   `nb_sessions` (referred to as `Facilitation sessions` in product-facing docs): Total count of `plan.session_milestones`. This is the total available in the plan, not member-specific completion.
            *   `more_daring_leader`: A static value (currently `1`), indicating participation or relevance to a specific program like "Dare to Lead".
        *   Retrieves a hardcoded list of DTL-related skills (defined directly within the `skills` method of `ComputeMemberStatsService`: [`'Rumbling with Vulnerability', 'Living into Your Values', 'Braving Trust', 'Learning to Rise'`]). A comment in the code notes: "# Hardcoded to DTL for now".
        *   Provides a hardcoded image path for DTL: `ActionController::Base.helpers.image_url('badge-dtl-trained.png')`.
    *   **Output**: A Hash containing three keys:
        *   `:stats` (Array of Hashes): Each hash contains `label` (String) and `amount` (Integer/Float) for the calculated statistics.
        *   `:skills` (Array of Strings): A list of skill names.
        *   `:image_path` (String): URL for the relevant image (e.g., DTL badge).
    *   **Usage**: Powers the "Get Member Stats API" endpoint (used by the Plan Completion Overlay frontend component via `usePlanMemberStats.ts` hook) and can be used for administrative dashboards or member-facing displays related to plan progress and DTL engagement. For product details, see `PRODUCT_OVERVIEW.md` Section 7.7.
