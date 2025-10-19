import { NextResponse } from "next/server";
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ 
      message: "Good!",
      database: "Connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      message: "Database connection failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}