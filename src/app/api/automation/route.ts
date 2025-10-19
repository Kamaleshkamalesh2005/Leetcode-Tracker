import { NextRequest, NextResponse } from 'next/server';
import { statsUpdater } from '@/lib/automation/stats-updater';

// GET /api/automation - Get automation status
export async function GET() {
  try {
    return NextResponse.json({
      status: 'running',
      message: 'Automation service is active',
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting automation status:', error);
    return NextResponse.json({ error: 'Failed to get automation status' }, { status: 500 });
  }
}

// POST /api/automation - Trigger manual update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'update-stats':
        await fetch('/api/students/update-stats', { method: 'GET' });
        return NextResponse.json({ message: 'Stats update triggered' });
      
      case 'detect-inactive':
        const response = await fetch('/api/students/inactive');
        const inactiveStudents = await response.json();
        return NextResponse.json({ 
          message: 'Inactive students detection completed',
          inactiveCount: inactiveStudents.length
        });
      
      case 'start':
        statsUpdater.start();
        return NextResponse.json({ message: 'Automation started' });
      
      case 'stop':
        statsUpdater.stop();
        return NextResponse.json({ message: 'Automation stopped' });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in automation:', error);
    return NextResponse.json({ error: 'Automation action failed' }, { status: 500 });
  }
}