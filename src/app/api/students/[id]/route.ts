import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/students/[id] - Update student info
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { name, leetcodeUsername } = body;
    const { id } = params;

    if (!name || !leetcodeUsername) {
      return NextResponse.json({ error: 'Name and LeetCode username are required' }, { status: 400 });
    }

    // Check if another student with same LeetCode username already exists
    const existingStudent = await db.student.findFirst({
      where: {
        leetcodeUsername,
        id: { not: id }
      }
    });

    if (existingStudent) {
      return NextResponse.json({ error: 'Student with this LeetCode username already exists' }, { status: 400 });
    }

    const student = await db.student.update({
      where: { id },
      data: {
        name,
        leetcodeUsername
      }
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

// DELETE /api/students/[id] - Delete a student
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await db.student.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}