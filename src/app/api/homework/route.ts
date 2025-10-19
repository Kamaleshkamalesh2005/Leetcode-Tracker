import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/homework - Fetch all homework
export async function GET() {
  try {
    const homework = await db.homework.findMany({
      include: {
        homeworkStatus: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                leetcodeUsername: true
              }
            }
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    return NextResponse.json(homework);
  } catch (error) {
    console.error('Error fetching homework:', error);
    return NextResponse.json({ error: 'Failed to fetch homework' }, { status: 500 });
  }
}

// POST /api/homework - Create new homework
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, link, difficulty, assignedBy, dueDate } = body;

    if (!title || !link || !difficulty || !assignedBy || !dueDate) {
      return NextResponse.json({ 
        error: 'Title, link, difficulty, assignedBy, and dueDate are required' 
      }, { status: 400 });
    }

    const homework = await db.homework.create({
      data: {
        title,
        link,
        difficulty,
        assignedBy,
        dueDate: new Date(dueDate)
      }
    });

    return NextResponse.json(homework, { status: 201 });
  } catch (error) {
    console.error('Error creating homework:', error);
    return NextResponse.json({ error: 'Failed to create homework' }, { status: 500 });
  }
}