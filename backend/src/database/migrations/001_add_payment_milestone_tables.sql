-- ============================================================================
-- Payment Milestone Integration - Database Migration
-- Description: Creates tables and columns for construction-linked payment system
-- Created: February 16, 2026
-- ============================================================================

-- 1. Payment Plan Templates Table
CREATE TABLE IF NOT EXISTS payment_plan_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('CONSTRUCTION_LINKED', 'TIME_LINKED', 'DOWN_PAYMENT')),
    description TEXT,
    milestones JSONB NOT NULL,
    total_percentage DECIMAL(5,2) NOT NULL DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_payment_plan_templates_type ON payment_plan_templates(type);
CREATE INDEX idx_payment_plan_templates_active ON payment_plan_templates(is_active);

COMMENT ON TABLE payment_plan_templates IS 'Reusable payment plan templates with milestone definitions';
COMMENT ON COLUMN payment_plan_templates.milestones IS 'Array of milestone objects with sequence, name, phase, percentage, etc.';

-- 2. Flat Payment Plans Table
CREATE TABLE IF NOT EXISTS flat_payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flat_id UUID NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    payment_plan_template_id UUID REFERENCES payment_plan_templates(id),
    
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    balance_amount DECIMAL(15,2) NOT NULL,
    
    milestones JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT unique_flat_booking UNIQUE(flat_id, booking_id)
);

CREATE INDEX idx_flat_payment_plans_flat ON flat_payment_plans(flat_id);
CREATE INDEX idx_flat_payment_plans_booking ON flat_payment_plans(booking_id);
CREATE INDEX idx_flat_payment_plans_customer ON flat_payment_plans(customer_id);
CREATE INDEX idx_flat_payment_plans_status ON flat_payment_plans(status);
CREATE INDEX idx_flat_payment_plans_template ON flat_payment_plans(payment_plan_template_id);

COMMENT ON TABLE flat_payment_plans IS 'Actual payment plan instance for each flat with milestone tracking';
COMMENT ON COLUMN flat_payment_plans.milestones IS 'Array of milestone instances with amounts, status, payment links';

-- 3. Demand Draft Templates Table
CREATE TABLE IF NOT EXISTS demand_draft_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_demand_draft_templates_active ON demand_draft_templates(is_active);

COMMENT ON TABLE demand_draft_templates IS 'HTML templates for auto-generating demand drafts';
COMMENT ON COLUMN demand_draft_templates.html_content IS 'HTML template with placeholders like {{customerName}}, {{amount}}, etc.';

-- 4. Add columns to construction_flat_progress
ALTER TABLE construction_flat_progress
ADD COLUMN IF NOT EXISTS is_payment_milestone BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS milestone_triggered BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS milestone_triggered_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS demand_draft_id UUID REFERENCES demand_drafts(id),
ADD COLUMN IF NOT EXISTS payment_schedule_id UUID REFERENCES payment_schedules(id),
ADD COLUMN IF NOT EXISTS milestone_approved_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS milestone_approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT TRUE;

CREATE INDEX idx_construction_flat_progress_milestone ON construction_flat_progress(is_payment_milestone) WHERE is_payment_milestone = TRUE;
CREATE INDEX idx_construction_flat_progress_triggered ON construction_flat_progress(milestone_triggered);

COMMENT ON COLUMN construction_flat_progress.is_payment_milestone IS 'Indicates if this progress checkpoint triggers a payment';
COMMENT ON COLUMN construction_flat_progress.milestone_triggered IS 'Has the payment demand been generated for this milestone?';

-- 5. Add columns to demand_drafts
ALTER TABLE demand_drafts
ADD COLUMN IF NOT EXISTS payment_schedule_id UUID REFERENCES payment_schedules(id),
ADD COLUMN IF NOT EXISTS flat_payment_plan_id UUID REFERENCES flat_payment_plans(id),
ADD COLUMN IF NOT EXISTS construction_checkpoint_id UUID REFERENCES construction_flat_progress(id),
ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS requires_review BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES demand_draft_templates(id),
ADD COLUMN IF NOT EXISTS template_data JSONB;

CREATE INDEX idx_demand_drafts_payment_schedule ON demand_drafts(payment_schedule_id);
CREATE INDEX idx_demand_drafts_flat_payment_plan ON demand_drafts(flat_payment_plan_id);
CREATE INDEX idx_demand_drafts_checkpoint ON demand_drafts(construction_checkpoint_id);
CREATE INDEX idx_demand_drafts_auto_generated ON demand_drafts(auto_generated);
CREATE INDEX idx_demand_drafts_requires_review ON demand_drafts(requires_review) WHERE requires_review = TRUE;

COMMENT ON COLUMN demand_drafts.auto_generated IS 'Was this demand draft automatically generated by the system?';
COMMENT ON COLUMN demand_drafts.template_data IS 'Merged data used to populate the template';

-- 6. Add index to payment_schedules.milestone
CREATE INDEX IF NOT EXISTS idx_payment_schedules_milestone ON payment_schedules(milestone);

-- 7. Add payment_plan_id column to flats
ALTER TABLE flats
ADD COLUMN IF NOT EXISTS payment_plan_id UUID REFERENCES flat_payment_plans(id);

CREATE INDEX idx_flats_payment_plan ON flats(payment_plan_id);

COMMENT ON COLUMN flats.payment_plan_id IS 'Links flat to its active payment plan';

-- 8. Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers for updated_at
CREATE TRIGGER update_payment_plan_templates_updated_at
    BEFORE UPDATE ON payment_plan_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flat_payment_plans_updated_at
    BEFORE UPDATE ON flat_payment_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demand_draft_templates_updated_at
    BEFORE UPDATE ON demand_draft_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Insert default payment plan template
INSERT INTO payment_plan_templates (name, type, description, milestones, total_percentage, is_active, is_default)
VALUES (
    'Standard Construction Linked - 7 Milestones',
    'CONSTRUCTION_LINKED',
    'Standard payment plan with 7 milestones linked to construction phases',
    '[
        {
            "sequence": 1,
            "name": "Token Amount",
            "constructionPhase": null,
            "phasePercentage": null,
            "paymentPercentage": 10,
            "description": "Initial booking token amount"
        },
        {
            "sequence": 2,
            "name": "On Foundation Completion",
            "constructionPhase": "FOUNDATION",
            "phasePercentage": 100,
            "paymentPercentage": 15,
            "description": "Payment due upon 100% foundation completion"
        },
        {
            "sequence": 3,
            "name": "On Structure 50%",
            "constructionPhase": "STRUCTURE",
            "phasePercentage": 50,
            "paymentPercentage": 20,
            "description": "Payment due when structure reaches 50%"
        },
        {
            "sequence": 4,
            "name": "On Structure Completion",
            "constructionPhase": "STRUCTURE",
            "phasePercentage": 100,
            "paymentPercentage": 20,
            "description": "Payment due upon 100% structure completion"
        },
        {
            "sequence": 5,
            "name": "On MEP Completion",
            "constructionPhase": "MEP",
            "phasePercentage": 100,
            "paymentPercentage": 15,
            "description": "Payment due upon MEP (Mechanical, Electrical, Plumbing) completion"
        },
        {
            "sequence": 6,
            "name": "On Finishing Completion",
            "constructionPhase": "FINISHING",
            "phasePercentage": 100,
            "paymentPercentage": 15,
            "description": "Payment due upon finishing work completion"
        },
        {
            "sequence": 7,
            "name": "On Possession",
            "constructionPhase": "HANDOVER",
            "phasePercentage": 100,
            "paymentPercentage": 5,
            "description": "Final payment upon possession/handover"
        }
    ]'::jsonb,
    100,
    TRUE,
    TRUE
);

-- 11. Insert default demand draft template
INSERT INTO demand_draft_templates (name, description, subject, html_content, is_active)
VALUES (
    'Standard Milestone Payment Demand',
    'Default template for construction milestone payment demands',
    'Payment Request - {{milestoneName}} for {{flatNumber}}',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #A8211B; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; display: inline-block; width: 200px; }
        .bank-details { background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #A8211B; }
        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .amount { font-size: 24px; color: #A8211B; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Eastern Estate</h1>
        <p>Building Homes, Nurturing Bonds</p>
    </div>
    
    <div class="content">
        <h2>Payment Demand Letter</h2>
        
        <p>Dear {{customerName}},</p>
        
        <p>Greetings from Eastern Estate!</p>
        
        <p>We are pleased to inform you that the construction of your property has reached an important milestone. As per the payment schedule agreed in your booking, we request payment for the following milestone:</p>
        
        <div class="detail-row">
            <span class="label">Property:</span>
            <span>{{propertyName}}</span>
        </div>
        
        <div class="detail-row">
            <span class="label">Tower:</span>
            <span>{{towerName}}</span>
        </div>
        
        <div class="detail-row">
            <span class="label">Flat Number:</span>
            <span>{{flatNumber}}</span>
        </div>
        
        <div class="detail-row">
            <span class="label">Milestone:</span>
            <span>{{milestoneName}}</span>
        </div>
        
        <div class="detail-row">
            <span class="label">Description:</span>
            <span>{{milestoneDescription}}</span>
        </div>
        
        <div class="detail-row">
            <span class="label">Amount Due:</span>
            <span class="amount">₹ {{amount}}</span>
        </div>
        
        <div class="detail-row">
            <span class="label">Due Date:</span>
            <span>{{dueDate}}</span>
        </div>
        
        <div class="bank-details">
            <h3>Bank Details for Payment</h3>
            <div class="detail-row">
                <span class="label">Bank Name:</span>
                <span>{{bankName}}</span>
            </div>
            <div class="detail-row">
                <span class="label">Account Name:</span>
                <span>{{accountName}}</span>
            </div>
            <div class="detail-row">
                <span class="label">Account Number:</span>
                <span>{{accountNumber}}</span>
            </div>
            <div class="detail-row">
                <span class="label">IFSC Code:</span>
                <span>{{ifscCode}}</span>
            </div>
            <div class="detail-row">
                <span class="label">Branch:</span>
                <span>{{branch}}</span>
            </div>
        </div>
        
        <p>Please make the payment by the due date and share the transaction details with us. For any queries, please feel free to contact us.</p>
        
        <p>Thank you for your continued trust in Eastern Estate.</p>
        
        <p>Warm Regards,<br>
        <strong>Eastern Estate Team</strong></p>
    </div>
    
    <div class="footer">
        <p>Eastern Estate | Building Homes, Nurturing Bonds</p>
        <p>This is a system-generated document. Please do not reply to this email.</p>
    </div>
</body>
</html>',
    TRUE
);

-- ============================================================================
-- Migration Complete
-- ============================================================================
