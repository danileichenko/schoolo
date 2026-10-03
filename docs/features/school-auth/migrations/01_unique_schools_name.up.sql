-- Expand existing schools: unique display name (column "name").
CREATE UNIQUE INDEX IF NOT EXISTS schools_name_key ON schools (name);
