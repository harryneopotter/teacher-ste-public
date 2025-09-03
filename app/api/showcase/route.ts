import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

export async function GET() {
  try {
    // Fetch showcase items from Firestore
    const showcaseRef = db.collection('showcase');
    const snapshot = await showcaseRef
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .get();

    const collections = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to strings
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({
      collections,
      lastUpdated: new Date().toISOString(),
      totalItems: collections.length,
    });

  } catch (error) {
    console.error('Error fetching showcase data:', error);
    
    // Fallback to static data if Firestore fails
    const staticShowcase = [
      {
        id: 1,
        title: "Fifilldi",
        author: "Student Creative Work",
        type: "Creative Writing Collection",
        description: "A comprehensive creative writing collection showcasing imaginative storytelling and creative expression from one of our talented students.",
        pdfUrl: "/api/pdfs/Fifilldi.pdf",
        thumbnailUrl: "/api/thumbnails/Fifilldi.jpg",
        publishedDate: "August 2024",
        status: "published",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Navedh Poem Portfolio",
        author: "Navedh",
        type: "Poetry Collection",
        description: "A beautiful collection of original poems exploring themes of nature, emotions, and imagination through the unique voice of young Navedh.",
        pdfUrl: "/api/pdfs/Navedh poem portfolio.pdf",
        thumbnailUrl: "/api/thumbnails/Navedh poem portfolio.jpg",
        publishedDate: "August 2024",
        status: "published",
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        title: "Varenyam Poem Portfolio",
        author: "Varenyam",
        type: "Poetry Collection",
        description: "An inspiring portfolio of poems that showcase Varenyam's growing confidence in creative expression and poetic voice.",
        pdfUrl: "/api/pdfs/Varenyam poem portfolio.pdf",
        thumbnailUrl: "/api/thumbnails/Varenyam poem portfolio.jpg",
        publishedDate: "August 2024",
        status: "published",
        createdAt: new Date().toISOString(),
      }
    ];

    return NextResponse.json({
      collections: staticShowcase,
      lastUpdated: new Date().toISOString(),
      totalItems: staticShowcase.length,
      fallback: true,
    });
  }
}