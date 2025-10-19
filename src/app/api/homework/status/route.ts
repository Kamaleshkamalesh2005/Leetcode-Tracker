import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/homework/status - Get all homework status
export async function GET() {
  try {
    const status = await db.homeworkStatus.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            leetcodeUsername: true
          }
        },
        homework: {
          select: {
            id: true,
            title: true,
            link: true,
            difficulty: true,
            dueDate: true
          }
        }
      }
    });

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching homework status:', error);
    return NextResponse.json({ error: 'Failed to fetch homework status' }, { status: 500 });
  }
}

// POST /api/homework/status - Update homework status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, homeworkId, status } = body;

    if (!studentId || !homeworkId || !status) {
      return NextResponse.json({ 
        error: 'Student ID, homework ID, and status are required' 
      }, { status: 400 });
    }

    // Check if status record exists
    const existingStatus = await db.homeworkStatus.findUnique({
      where: {
        studentId_homeworkId: {
          studentId,
          homeworkId
        }
      }
    });

    let statusRecord;
    if (existingStatus) {
      // Update existing status
      statusRecord = await db.homeworkStatus.update({
        where: { id: existingStatus.id },
        data: {
          status,
          solvedAt: status === 'SOLVED' ? new Date() : null
        }
      });
    } else {
      // Create new status record
      statusRecord = await db.homeworkStatus.create({
        data: {
          studentId,
          homeworkId,
          status,
          solvedAt: status === 'SOLVED' ? new Date() : null
        }
      });
    }

    return NextResponse.json(statusRecord);
  } catch (error) {
    console.error('Error updating homework status:', error);
    return NextResponse.json({ error: 'Failed to update homework status' }, { status: 500 });
  }
}