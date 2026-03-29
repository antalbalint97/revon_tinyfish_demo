-- Add operator override fields to discovery_leads table
ALTER TABLE discovery_leads ADD COLUMN operator_qualification_state TEXT DEFAULT NULL;
ALTER TABLE discovery_leads ADD COLUMN operator_override_reason TEXT DEFAULT NULL;
ALTER TABLE discovery_leads ADD COLUMN operator_override_updated_at TEXT DEFAULT NULL;
