-- Verify and update users table token columns
ALTER TABLE users
MODIFY COLUMN session_token VARCHAR(255),
MODIFY COLUMN token_expiry DATETIME;

-- Add index for session token if not exists
CREATE INDEX IF NOT EXISTS idx_session_token ON users(session_token);

-- Update existing tokens to have expiry
UPDATE users 
SET token_expiry = DATE_ADD(NOW(), INTERVAL 24 HOUR) 
WHERE session_token IS NOT NULL AND token_expiry IS NULL;

-- Show current token status
SELECT id, userEmail, 
       SUBSTRING(session_token, 1, 10) as token_preview, 
       token_expiry,
       CASE 
           WHEN token_expiry < NOW() THEN 'expired'
           WHEN token_expiry >= NOW() THEN 'valid'
           ELSE 'no expiry'
       END as token_status
FROM users
WHERE session_token IS NOT NULL; 