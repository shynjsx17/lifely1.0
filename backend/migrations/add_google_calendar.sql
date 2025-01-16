ALTER TABLE users
ADD COLUMN google_access_token TEXT NULL,
ADD COLUMN google_refresh_token TEXT NULL,
ADD COLUMN google_calendar_connected BOOLEAN DEFAULT FALSE; 