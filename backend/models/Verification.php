<?php
class Verification {
    private $conn;
    private $table = 'verifications';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function createOrUpdate($email, $otp, $expires_at) {
        try {
            $this->conn->beginTransaction();

            error_log("Starting OTP creation for email: $email");
            
            // Delete any existing records for this email first
            $deleteQuery = "DELETE FROM " . $this->table . " WHERE email = ?";
            $deleteStmt = $this->conn->prepare($deleteQuery);
            if (!$deleteStmt->execute([$email])) {
                error_log("Failed to delete existing OTP records: " . json_encode($deleteStmt->errorInfo()));
                throw new PDOException("Failed to delete existing OTP records");
            }
            error_log("Deleted existing OTP records for email: $email");
            
            // Insert new record
            $insertQuery = "INSERT INTO " . $this->table . " 
                          (email, otp, expires_at, verified) 
                          VALUES (?, ?, ?, FALSE)";
            
            $stmt = $this->conn->prepare($insertQuery);
            if (!$stmt) {
                error_log("Failed to prepare insert statement: " . json_encode($this->conn->errorInfo()));
                throw new PDOException("Failed to prepare insert statement");
            }

            $result = $stmt->execute([$email, $otp, $expires_at]);
            if (!$result) {
                error_log("Failed to execute insert: " . json_encode($stmt->errorInfo()));
                throw new PDOException("Failed to insert new OTP record");
            }

            $this->conn->commit();
            error_log("Successfully created new OTP record for email: $email");
            return true;

        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("Database error in createOrUpdate: " . $e->getMessage());
            error_log("Error details: " . json_encode([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'email' => $email,
                'expires_at' => $expires_at
            ]));
            throw new Exception("Failed to save OTP: " . $e->getMessage());
        }
    }

    public function verifyOTP($email, $otp) {
        try {
            error_log("Starting OTP verification for email: $email with code: $otp");
            
            // First check if the OTP exists at all
            $checkQuery = "SELECT * FROM " . $this->table . "
                         WHERE email = ?
                         LIMIT 1";
            
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->execute([$email]);
            $record = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$record) {
                error_log("No OTP record found for email: $email");
                throw new Exception("No verification code found. Please request a new one.");
            }
            
            error_log("Found OTP record: " . json_encode($record));
            
            // Now check if it matches and is valid
            if ($record['otp'] !== $otp) {
                error_log("OTP mismatch for email: $email. Expected: {$record['otp']}, Got: $otp");
                throw new Exception("Invalid verification code");
            }
            
            if (strtotime($record['expires_at']) <= time()) {
                error_log("Expired OTP attempt for email: $email. Expired at: {$record['expires_at']}");
                throw new Exception("OTP has expired. Please request a new one.");
            }
            
            if ($record['verified']) {
                error_log("Already verified OTP attempt for email: $email");
                throw new Exception("This code has already been used. Please request a new one.");
            }
            
            // Mark as verified
            $updateQuery = "UPDATE " . $this->table . "
                          SET verified = TRUE
                          WHERE email = ? AND otp = ?";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateResult = $updateStmt->execute([$email, $otp]);
            
            if (!$updateResult) {
                error_log("Failed to mark OTP as verified: " . json_encode($updateStmt->errorInfo()));
                throw new Exception("Failed to verify code");
            }
            
            error_log("OTP verified successfully for email: $email");
            return true;

        } catch (PDOException $e) {
            error_log("Database error in verifyOTP: " . $e->getMessage());
            error_log("Error details: " . json_encode([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'email' => $email,
                'otp' => $otp
            ]));
            throw new Exception("Database error during verification: " . $e->getMessage());
        }
    }

    public function isEmailVerified($email) {
        try {
            $query = "SELECT verified FROM " . $this->table . " 
                     WHERE email = ? AND verified = TRUE 
                     LIMIT 1";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([$email]);

            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Database error in isEmailVerified: " . $e->getMessage());
            throw new Exception("Failed to check email verification status");
        }
    }
} 