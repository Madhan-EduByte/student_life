"""
DestinAI — Email Service
SMTP email sending for OTP, notifications, and welcome emails.
"""

import logging
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Email service for sending notifications."""

    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None,
    ) -> bool:
        """Send an email via SMTP."""
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning("SMTP not configured. Skipping email send.")
            return False

        try:
            import aiosmtplib
            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText

            message = MIMEMultipart("alternative")
            message["From"] = settings.EMAIL_FROM
            message["To"] = to_email
            message["Subject"] = subject

            # Attach plain text
            message.attach(MIMEText(body, "plain"))

            # Attach HTML if provided
            if html_body:
                message.attach(MIMEText(html_body, "html"))

            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                use_tls=True,
            )

            logger.info(f"Email sent to {to_email}: {subject}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    async def send_welcome_email(self, to_email: str, full_name: str) -> bool:
        """Send a welcome email to a new user."""
        subject = "Welcome to DestinAI — Your Destiny, Powered by AI"
        body = f"""Hi {full_name},

Welcome to DestinAI! 🎯

You've taken the first step toward discovering your ideal career path.

Here's what you can do next:
1. Complete the 6-question career assessment
2. Explore your personalized AI roadmap
3. Discover matched colleges and courses
4. Start completing weekly milestones

Your future starts now.

Best regards,
The DestinAI Team
"""
        html_body = f"""
<html>
<body style="font-family: 'Inter', sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to DestinAI 🎯</h1>
    </div>
    <div style="padding: 30px; background: #fff; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
        <p>Hi <strong>{full_name}</strong>,</p>
        <p>You've taken the first step toward discovering your ideal career path.</p>
        <h3>What's next?</h3>
        <ol>
            <li>Complete the 6-question career assessment</li>
            <li>Explore your personalized AI roadmap</li>
            <li>Discover matched colleges and courses</li>
            <li>Start completing weekly milestones</li>
        </ol>
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Best regards,<br>The DestinAI Team
        </p>
    </div>
</body>
</html>
"""
        return await self.send_email(to_email, subject, body, html_body)

    async def send_otp_email(
        self, to_email: str, otp_code: str
    ) -> bool:
        """Send OTP verification email."""
        subject = "DestinAI — Your Verification Code"
        body = f"""Your DestinAI verification code is: {otp_code}

This code expires in 10 minutes. Do not share it with anyone.

If you didn't request this code, please ignore this email.

— DestinAI Team
"""
        return await self.send_email(to_email, subject, body)


# Singleton instance
email_service = EmailService()
