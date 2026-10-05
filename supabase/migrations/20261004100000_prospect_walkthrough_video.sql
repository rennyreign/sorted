ALTER TABLE prospects ADD COLUMN IF NOT EXISTS walkthrough_video_url text;
COMMENT ON COLUMN prospects.walkthrough_video_url IS 'Direct mp4/webm URL of a short talking-head video shown on the workspace website tab.';
