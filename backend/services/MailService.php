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
        $this->mailer->SMTPDebug = 0;
        
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
            $this->mailer->clearAllRecipients();
            $this->mailer->clearAttachments();
            
            $this->mailer->addAddress($to);
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Lifely - Email Verification Code';
            
            $this->mailer->Body = $this->getEmailTemplate(
                'Verify Your Email',
                'Your verification code is:',
                $this->getOTPContent($otp),
                'This code will expire in 15 minutes.',
                'If you didn\'t request this code, please ignore this email.'
            );
            
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

    public function sendPasswordResetLink($to, $resetLink) {
        try {
            $this->mailer->clearAllRecipients();
            $this->mailer->clearAttachments();
            
            $this->mailer->addAddress($to);
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Reset Your Lifely Password';
            
            $this->mailer->Body = $this->getEmailTemplate(
                'Reset Your Password',
                'You\'ve requested to reset your password. Click the button below to proceed:',
                $this->getResetButtonContent($resetLink),
                'This link will expire in 1 hour.',
                'If you didn\'t request a password reset, please ignore this email.'
            );
            
            $this->mailer->AltBody = "Reset your password by clicking this link: $resetLink\n\n" .
                                    "This link will expire in 1 hour.\n" .
                                    "If you didn't request this reset, please ignore this email.";

            $result = $this->mailer->send();
            error_log("Password reset email sent successfully to: $to");
            return $result;
        } catch (Exception $e) {
            error_log("Mail Error: " . $e->getMessage());
            throw new Exception("Failed to send password reset email. Please try again later.");
        }
    }

    private function getEmailTemplate($title, $message, $content, $expiry, $disclaimer) {
        return '
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #FB923C; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Lifely</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                <h2 style="color: #333;">' . $title . '</h2>
                <p style="color: #666;">' . $message . '</p>
                ' . $content . '
                <p style="color: #666; font-size: 14px;">' . $expiry . '</p>
                <p style="color: #666; font-size: 14px;">' . $disclaimer . '</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>© ' . date('Y') . ' Lifely. All rights reserved.</p>
            </div>
        </div>';
    }

    private function getOTPContent($otp) {
        return '
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; letter-spacing: 5px; color: #333;">' . $otp . '</span>
        </div>';
    }

    private function getResetButtonContent($resetLink) {
        return '
        <div style="text-align: center; margin: 30px 0;">
            <a href="' . $resetLink . '" 
               style="background-color: #FB923C; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 5px;
                      display: inline-block;
                      font-weight: bold;">
                Reset Password
            </a>
        </div>';
    }
} 