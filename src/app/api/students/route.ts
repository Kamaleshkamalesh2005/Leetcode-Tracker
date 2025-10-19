import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/students - Fetch all students with stats
export async function GET() {
  try {
    console.log('Fetching students...');
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
        score: 'desc'
      }
    });

    console.log('Found students:', students.length);
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

// POST /api/students - Add a new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, leetcodeUsername, userId } = body;

    if (!name || !leetcodeUsername) {
      return NextResponse.json({ error: 'Name and LeetCode username are required' }, { status: 400 });
    }

    // Check if student with same LeetCode username already exists
    const existingStudent = await db.student.findFirst({
      where: {
        leetcodeUsername
      }
    });

    if (existingStudent) {
      return NextResponse.json({ error: 'Student with this LeetCode username already exists' }, { status: 400 });
    }

    const student = await db.student.create({
      data: {
        name,
        leetcodeUsername,
        userId
      }
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}