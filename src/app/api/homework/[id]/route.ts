import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/homework/[id] - Update homework
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { title, link, difficulty, assignedBy, dueDate } = body;
    const { id } = params;

    if (!title || !link || !difficulty || !assignedBy || !dueDate) {
      return NextResponse.json({ 
        error: 'Title, link, difficulty, assignedBy, and dueDate are required' 
      }, { status: 400 });
    }

    const homework = await db.homework.update({
      where: { id },
      data: {
        title,
        link,
        difficulty,
        assignedBy,
        dueDate: new Date(dueDate)
      }
    });

    return NextResponse.json(homework);
  } catch (error) {
    console.error('Error updating homework:', error);
    return NextResponse.json({ error: 'Failed to update homework' }, { status: 500 });
  }
}

// DELETE /api/homework/[id] - Delete homework
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await db.homework.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Homework deleted successfully' });
  } catch (error) {
    console.error('Error deleting homework:', error);
    return NextResponse.json({ error: 'Failed to delete homework' }, { status: 500 });
  }
}