-- Add workflow columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS research_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS lovable_prompts JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS cursor_frontend_prompts JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS cursor_backend_prompts JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN projects.research_data IS 'Stores research results and project logic';
COMMENT ON COLUMN projects.lovable_prompts IS 'Stores prompts for Lovable (No-code) generation';
COMMENT ON COLUMN projects.cursor_frontend_prompts IS 'Stores prompts for Cursor Frontend development';
COMMENT ON COLUMN projects.cursor_backend_prompts IS 'Stores prompts for Cursor Backend development';
