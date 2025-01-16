-- Add session token fields to users table
ALTER TABLE users
ADD COLUMN session_token VARCHAR(64) DEFAULT NULL,
ADD COLUMN token_expiry DATETIME DEFAULT NULL,
ADD INDEX session_token_idx (session_token); 

-- Add session token column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_token VARCHAR(255) DEFAULT NULL; 