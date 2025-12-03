-- Update projects table for multi-source support
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Migrate existing data (if any)
-- This is a best-effort migration assuming single source structure existed
UPDATE projects 
SET sources = jsonb_build_array(
    jsonb_build_object(
        'type', source,
        'path', path,
        'name', 'Main Source'
    )
)
WHERE sources = '[]'::jsonb AND source IS NOT NULL;

-- Optional: Drop old columns if you are sure
-- ALTER TABLE projects DROP COLUMN source;
-- ALTER TABLE projects DROP COLUMN path;

COMMENT ON COLUMN projects.sources IS 'Array of project sources (GitHub, Drive, Local)';
COMMENT ON COLUMN projects.status IS 'Project status: active, archived, deleted';
