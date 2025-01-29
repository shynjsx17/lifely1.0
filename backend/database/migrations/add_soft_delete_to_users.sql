-- First, check if the unique email index exists and drop it
ALTER TABLE users 
DROP INDEX IF EXISTS email,
DROP INDEX IF EXISTS unique_email_not_deleted;

-- Add the soft delete columns
ALTER TABLE users 
ADD COLUMN is_deleted TINYINT(1) DEFAULT 0 COMMENT 'Soft delete flag',
ADD COLUMN deleted_at DATETIME DEFAULT NULL COMMENT 'Timestamp when the user was deleted';

-- Now that the column exists, add the indexes
ALTER TABLE users 
ADD INDEX idx_is_deleted (is_deleted),
ADD UNIQUE INDEX unique_email_not_deleted (email, is_deleted);

-- Update any existing records
UPDATE users SET is_deleted = 0 WHERE is_deleted IS NULL;

-- Add trigger to prevent duplicate emails for active users
DELIMITER //

DROP TRIGGER IF EXISTS before_user_insert//
CREATE TRIGGER before_user_insert 
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM users 
        WHERE email = NEW.email 
        AND is_deleted = 0
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Email already exists for an active user';
    END IF;
END//

DROP TRIGGER IF EXISTS before_user_update//
CREATE TRIGGER before_user_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.email != OLD.email AND EXISTS (
        SELECT 1 
        FROM users 
        WHERE email = NEW.email 
        AND is_deleted = 0 
        AND id != NEW.id
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Email already exists for an active user';
    END IF;
END//

DELIMITER ; 