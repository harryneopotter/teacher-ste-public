import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  // In Cloud Run, use default service account
  if (process.env.GOOGLE_CLOUD_PROJECT) {
    initializeApp({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });
  } else {
    // For local development, you might need to set GOOGLE_APPLICATION_CREDENTIALS
    initializeApp();
  }
}

const db = getFirestore();

// Verify CAPTCHA token with Google reCAPTCHA
async function verifyCaptcha(token: string): Promise<boolean> {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY not found, skipping CAPTCHA verification');
      return true; // Allow in development if key not set
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    if (!data.success) {
      console.error('CAPTCHA verification failed:', data['error-codes']);
      return false;
    }

    // Check score for reCAPTCHA v3 (if using v3)
    if (data.score !== undefined && data.score < 0.5) {
      console.error('CAPTCHA score too low:', data.score);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying CAPTCHA:', error);
    return false;
  }
}

// Send Telegram notification for new applications
async function sendTelegramNotification(applicationData: FirestoreApplicationData, applicationId: string) {
  try {
    // Get bot token from environment or Secret Manager
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn('TELEGRAM_BOT_TOKEN not found, skipping notification');
      return;
    }

    // Get admin user ID (you'll need to replace this with the actual user ID)
    const adminUserId = process.env.TELEGRAM_ADMIN_USER_ID || '41661658';

    const message = `
📋 **New Application Received!**

👤 **Student:** ${applicationData.studentName}
📚 **Grade:** ${applicationData.grade}
📞 **Phone:** ${applicationData.phoneNumber}
🎓 **Program:** ${applicationData.program}
💬 **Comments:** ${applicationData.comments || 'None'}

📅 **Submitted:** ${new Date().toLocaleString()}
🆔 **Application ID:** ${applicationId}
    `;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: adminUserId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    console.log('Telegram notification sent successfully');
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    throw error;
  }
}

interface ApplicationFormData {
  name: string;
  grade: string;
  phone: string;
  program: string;
  comments?: string;
  captchaToken?: string;
}

interface FirestoreApplicationData {
  studentName: string;
  grade: string;
  phoneNumber: string;
  program: string;
  comments: string;
  submittedAt: FieldValue;
  ipAddress: string;
  captchaVerified: boolean;
  status: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData: ApplicationFormData = await request.json();
    
    // Basic validation
    if (!formData.name || !formData.grade || !formData.phone || !formData.program) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify CAPTCHA token
    if (formData.captchaToken) {
      const captchaValid = await verifyCaptcha(formData.captchaToken);
      if (!captchaValid) {
        return NextResponse.json(
          { success: false, message: 'CAPTCHA verification failed. Please try again.' },
          { status: 400 }
        );
      }
    } else {
      // Require CAPTCHA for all submissions
      return NextResponse.json(
        { success: false, message: 'CAPTCHA verification is required.' },
        { status: 400 }
      );
    }

    // Get client IP for spam prevention
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Save application to Firestore
    const applicationData = {
      studentName: formData.name,
      grade: formData.grade,
      phoneNumber: formData.phone,
      program: formData.program,
      comments: formData.comments || '',
      submittedAt: FieldValue.serverTimestamp(),
      ipAddress: clientIP,
      captchaVerified: !!formData.captchaToken,
      status: 'new',
    };

    const docRef = await db.collection('applications').add(applicationData);

    // Send Telegram notification
    try {
      await sendTelegramNotification(applicationData, docRef.id);
    } catch (notificationError) {
      console.error('Failed to send Telegram notification:', notificationError);
      // Don't fail the entire request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! Tanya will contact you soon.',
      applicationId: docRef.id,
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}