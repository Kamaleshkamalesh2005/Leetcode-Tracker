import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/homework/status/[studentId] - Get homework status for a specific student
export async function GET(request: NextRequest, { params }: { params: { studentId: string } }) {
  try {
    const { studentId } = params;

    const status = await db.homeworkStatus.findMany({
      where: { studentId },
      include: {
        homework: {
          select: {
            id: true,
            title: true,
            link: true,
            difficulty: true,
            dueDate: true,
            assignedBy: true
          }
        }
      },
      orderBy: {
        homework: {
          dueDate: 'asc'
        }
      }
    });

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching student homework status:', error);
    return NextResponse.json({ error: 'Failed to fetch student homework status' }, { status: 500 });
  }
}