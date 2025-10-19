import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/students/inactive - Get students with 0 problems solved this week
export async function GET() {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoTimestamp = Math.floor(oneWeekAgo.getTime() / 1000);

    const students = await db.student.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        lastUpdated: 'asc'
      }
    });

    // Filter students who haven't solved any problems this week
    const inactiveStudents = students.filter(student => {
      // If student has no submission calendar data, they're inactive
      if (!student.submissionCalendar) {
        return true;
      }

      try {
        // Parse the submission calendar
        const calendar = JSON.parse(student.submissionCalendar);
        
        // Check if there are any submissions in the last week
        const hasRecentActivity = Object.keys(calendar).some(timestamp => {
          const ts = parseInt(timestamp);
          return ts >= oneWeekAgoTimestamp;
        });

        return !hasRecentActivity;
      } catch (error) {
        console.error('Error parsing submission calendar for student:', student.name, error);
        return true; // Consider inactive if we can't parse the calendar
      }
    });

    return NextResponse.json(inactiveStudents);
  } catch (error) {
    console.error('Error fetching inactive students:', error);
    return NextResponse.json({ error: 'Failed to fetch inactive students' }, { status: 500 });
  }
}