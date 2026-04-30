
-- Add registration number validation rules to elections
ALTER TABLE elections ADD COLUMN IF NOT EXISTS reg_no_rule TEXT;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS reg_no_example TEXT;

-- Update existing elections to have a default (optional) rule if needed
-- For now, we'll leave them as NULL, meaning no registration number check required
