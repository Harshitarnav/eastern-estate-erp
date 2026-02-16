-- Add construction tracking fields to flats table
ALTER TABLE flats 
ADD COLUMN IF NOT EXISTS construction_stage VARCHAR(50),
ADD COLUMN IF NOT EXISTS construction_progress DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_construction_update TIMESTAMP;

-- Add comment
COMMENT ON COLUMN flats.construction_stage IS 'Current construction phase: FOUNDATION, STRUCTURE, MEP, FINISHING, HANDOVER';
COMMENT ON COLUMN flats.construction_progress IS 'Overall construction completion percentage (0-100)';
COMMENT ON COLUMN flats.last_construction_update IS 'Timestamp of last construction progress update';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_flats_construction_stage ON flats(construction_stage);
CREATE INDEX IF NOT EXISTS idx_flats_construction_progress ON flats(construction_progress);
