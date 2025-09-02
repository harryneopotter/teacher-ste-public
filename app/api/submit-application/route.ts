import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
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

interface ApplicationFormData {
  name: string;
  grade: string;
  phone: string;
  program: string;
  comments?: string;
  captchaToken?: string;
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

    // TODO: Verify CAPTCHA token here
    // if (formData.captchaToken) {
    //   const captchaValid = await verifyCaptcha(formData.captchaToken);
    //   if (!captchaValid) {
    //     return NextResponse.json(
    //       { success: false, message: 'CAPTCHA verification failed' },
    //       { status: 400 }
    //     );
    //   }
    // }

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

    // TODO: Send Telegram notification here
    // await sendTelegramNotification(applicationData, docRef.id);

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