-- v010: Create employee_feedback and employee_reviews tables
-- All column names use snake_case to match TypeORM's default naming strategy.

-- ─── employee_feedback ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "employee_feedback" (
  "id"                          uuid        NOT NULL DEFAULT gen_random_uuid(),
  "employee_id"                 uuid        NOT NULL,
  "provider_id"                 uuid,
  "provider_name"               varchar(200),
  "provider_designation"        varchar(200),
  "provider_relationship"       varchar(200),
  "feedback_type"               varchar     NOT NULL,
  "feedback_title"              varchar(200) NOT NULL,
  "feedback_date"               date        NOT NULL,
  "feedback_status"             varchar     NOT NULL DEFAULT 'DRAFT',
  "positive_aspects"            text,
  "areas_for_improvement"       text,
  "specific_examples"           text,
  "recommendations"             text,
  "general_comments"            text,
  "technical_skills_rating"     numeric(3,2),
  "communication_rating"        numeric(3,2),
  "teamwork_rating"             numeric(3,2),
  "leadership_rating"           numeric(3,2),
  "problem_solving_rating"      numeric(3,2),
  "reliability_rating"          numeric(3,2),
  "professionalism_rating"      numeric(3,2),
  "overall_rating"              numeric(3,2),
  "is_anonymous"                boolean     NOT NULL DEFAULT false,
  "employee_acknowledged"       boolean     NOT NULL DEFAULT false,
  "employee_acknowledged_at"    timestamp,
  "employee_response"           text,
  "manager_reviewed"            boolean     NOT NULL DEFAULT false,
  "manager_reviewed_by"         uuid,
  "manager_reviewed_at"         timestamp,
  "manager_comments"            text,
  "attachments"                 text,
  "notes"                       text,
  "is_active"                   boolean     NOT NULL DEFAULT true,
  "created_at"                  TIMESTAMP   NOT NULL DEFAULT now(),
  "updated_at"                  TIMESTAMP   NOT NULL DEFAULT now(),
  "created_by"                  uuid,
  "updated_by"                  uuid,
  CONSTRAINT "PK_employee_feedback" PRIMARY KEY ("id"),
  CONSTRAINT "FK_employee_feedback_employee"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_employee_feedback_employee_id"   ON "employee_feedback" ("employee_id");
CREATE INDEX IF NOT EXISTS "IDX_employee_feedback_feedback_type" ON "employee_feedback" ("feedback_type");
CREATE INDEX IF NOT EXISTS "IDX_employee_feedback_feedback_date" ON "employee_feedback" ("feedback_date");

-- ─── employee_reviews ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "employee_reviews" (
  "id"                              uuid        NOT NULL DEFAULT gen_random_uuid(),
  "employee_id"                     uuid        NOT NULL,
  "review_type"                     varchar     NOT NULL,
  "review_title"                    varchar(200) NOT NULL,
  "review_date"                     date        NOT NULL,
  "review_period_start"             date        NOT NULL,
  "review_period_end"               date        NOT NULL,
  "review_status"                   varchar     NOT NULL DEFAULT 'SCHEDULED',
  "reviewer_id"                     uuid,
  "reviewer_name"                   varchar(200),
  "reviewer_designation"            varchar(200),
  "technical_skills_rating"         numeric(3,2),
  "communication_rating"            numeric(3,2),
  "teamwork_rating"                 numeric(3,2),
  "leadership_rating"               numeric(3,2),
  "problem_solving_rating"          numeric(3,2),
  "initiative_rating"               numeric(3,2),
  "punctuality_rating"              numeric(3,2),
  "quality_of_work_rating"          numeric(3,2),
  "productivity_rating"             numeric(3,2),
  "attendance_rating"               numeric(3,2),
  "overall_rating"                  numeric(3,2) NOT NULL,
  "achievements"                    text,
  "strengths"                       text,
  "areas_of_improvement"            text,
  "goals"                           text,
  "training_needs"                  text,
  "development_plan"                text,
  "reviewer_comments"               text,
  "employee_comments"               text,
  "target_achievement"              numeric(15,2),
  "actual_achievement"              numeric(15,2),
  "kpi_achievement_percentage"      numeric(5,2),
  "recommended_for_promotion"       boolean     NOT NULL DEFAULT false,
  "recommended_for_increment"       boolean     NOT NULL DEFAULT false,
  "recommended_increment_percentage" numeric(5,2),
  "recommended_for_bonus"           boolean     NOT NULL DEFAULT false,
  "recommended_bonus_amount"        numeric(15,2),
  "recommended_for_training"        boolean     NOT NULL DEFAULT false,
  "training_recommendations"        text,
  "action_items"                    text,
  "next_review_date"                date,
  "employee_acknowledged"           boolean     NOT NULL DEFAULT false,
  "employee_acknowledged_at"        timestamp,
  "manager_approved"                boolean     NOT NULL DEFAULT false,
  "manager_approved_by"             uuid,
  "manager_approved_at"             timestamp,
  "attachments"                     text,
  "notes"                           text,
  "is_active"                       boolean     NOT NULL DEFAULT true,
  "created_at"                      TIMESTAMP   NOT NULL DEFAULT now(),
  "updated_at"                      TIMESTAMP   NOT NULL DEFAULT now(),
  "created_by"                      uuid,
  "updated_by"                      uuid,
  CONSTRAINT "PK_employee_reviews" PRIMARY KEY ("id"),
  CONSTRAINT "FK_employee_reviews_employee"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_employee_reviews_employee_id" ON "employee_reviews" ("employee_id");
CREATE INDEX IF NOT EXISTS "IDX_employee_reviews_review_type" ON "employee_reviews" ("review_type");
CREATE INDEX IF NOT EXISTS "IDX_employee_reviews_review_date" ON "employee_reviews" ("review_date");
