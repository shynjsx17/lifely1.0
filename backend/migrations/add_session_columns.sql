ALTER TABLE users
ADD COLUMN session_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN token_expiry DATETIME DEFAULT NULL,
ADD INDEX idx_session_token (session_token),
ADD INDEX idx_token_expiry (token_expiry); 