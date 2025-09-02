import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    }),
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
  });
}

const db = getFirestore();

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      database: 'unknown',
      storage: 'unknown',
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  try {
    // Test Firestore connection
    await db.collection('system_health').limit(1).get();
    healthCheck.services.database = 'healthy';
  } catch (error) {
    console.error('Database health check failed:', error);
    healthCheck.services.database = 'error';
    healthCheck.status = 'degraded';
  }

  // TODO: Test Cloud Storage connection
  // try {
  //   const storage = getStorage();
  //   await storage.bucket().getMetadata();
  //   healthCheck.services.storage = 'healthy';
  // } catch (error) {
  //   healthCheck.services.storage = 'error';
  //   healthCheck.status = 'degraded';
  // }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  
  return NextResponse.json(healthCheck, { status: statusCode });
}