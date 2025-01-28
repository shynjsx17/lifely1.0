<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class MailService {
    private $mailer;
    private $config;

    public function __construct() {
        // Load mail configuration
        $this->config = require __DIR__ . '/../config/mail_config.php';
        
        $this->mailer = new PHPMailer(true);
        
        // Disable debug output in production
        $this->mailer->SMTPDebug = 0; // 0 = off, 1 = client messages, 2 = client and server messages
        
        // Server settings
        $this->mailer->isSMTP();
        $this->mailer->Host = $this->config['MAIL_HOST'];
        $this->mailer->SMTPAuth = true;
        $this->mailer->Username = $this->config['MAIL_USERNAME'];
        $this->mailer->Password = $this->config['MAIL_PASSWORD'];
        $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mailer->Port = $this->config['MAIL_PORT'];
        
        // Default sender
        $this->mailer->setFrom(
            $this->config['MAIL_FROM_ADDRESS'],
            $this->config['MAIL_FROM_NAME']
        );
    }

    public function sendOTP($to, $otp) {
        try {
            // Clear all recipients and attachments
            $this->mailer->clearAllRecipients();
            $this->mailer->clearAttachments();
            
            // Recipients
            $this->mailer->addAddress($to);
            
            // Content
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Lifely - Email Verification Code';
            
            // HTML email body
            $this->mailer->Body = $this->getOTPEmailTemplate($otp);
            
            // Plain text version for non-HTML mail clients
            $this->mailer->AltBody = "Your verification code is: $otp\n\n" .
                                    "This code will expire in 15 minutes.\n" .
                                    "If you didn't request this code, please ignore this email.";

            $result = $this->mailer->send();
            error_log("Email sent successfully to: $to");
            return $result;
        } catch (Exception $e) {
            error_log("Mail Error: " . $e->getMessage());
            throw new Exception("Email could not be sent. Please try again later.");
        }
    }

    private function getOTPEmailTemplate($otp) {
        return '
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #FB923C; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Lifely</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                <h2 style="color: #333;">Verify Your Email</h2>
                <p style="color: #666;">Your verification code is:</p>
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 24px; letter-spacing: 5px; color: #333;">' . $otp . '</span>
                </div>
                <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
                <p style="color: #666; font-size: 14px;">If you didn\'t request this code, please ignore this email.</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>© ' . date('Y') . ' Lifely. All rights reserved.</p>
            </div>
        </div>';
    }
} 