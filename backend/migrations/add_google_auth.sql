ALTER TABLE users
ADD COLUMN google_id VARCHAR(255) DEFAULT NULL,
ADD UNIQUE INDEX google_id_idx (google_id); 