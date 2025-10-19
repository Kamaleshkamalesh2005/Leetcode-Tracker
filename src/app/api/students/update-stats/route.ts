import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// LeetCode GraphQL query
const LEETCODE_QUERY = `
  query getUserProfile($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      submitStats {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      submissionCalendar
    }
  }
`;

async function fetchLeetCodeStats(username: string) {
  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        query: LEETCODE_QUERY,
        variables: { username }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    const { matchedUser, allQuestionsCount } = data.data;
    
    if (!matchedUser) {
      throw new Error('User not found');
    }

    const stats = matchedUser.submitStats.acSubmissionNum;
    const easySolved = stats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
    const mediumSolved = stats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
    const hardSolved = stats.find((s: any) => s.difficulty === 'Hard')?.count || 0;
    
    // Calculate score: Easy*1 + Medium*2 + Hard*3
    const score = easySolved * 1 + mediumSolved * 2 + hardSolved * 3;

    return {
      easySolved,
      mediumSolved,
      hardSolved,
      score,
      submissionCalendar: matchedUser.submissionCalendar
    };
  } catch (error) {
    console.error('Error fetching LeetCode stats:', error);
    throw error;
  }
}

// POST /api/students/update-stats - Update stats from LeetCode API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    console.log(`Updating stats for student ID: ${studentId}`);

    // Get student info
    const student = await db.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    console.log(`Fetching LeetCode stats for username: ${student.leetcodeUsername}`);

    // Fetch stats from LeetCode API
    const stats = await fetchLeetCodeStats(student.leetcodeUsername);

    console.log(`Successfully fetched stats for ${student.leetcodeUsername}:`, stats);

    // Update student in database
    const updatedStudent = await db.student.update({
      where: { id: studentId },
      data: {
        easySolved: stats.easySolved,
        mediumSolved: stats.mediumSolved,
        hardSolved: stats.hardSolved,
        score: stats.score,
        submissionCalendar: stats.submissionCalendar,
        lastUpdated: new Date(),
        isActive: stats.score > 0 // Mark as active if they have solved any problems
      }
    });

    console.log(`Successfully updated student ${student.leetcodeUsername} in database`);

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student stats:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to update student stats' 
    }, { status: 500 });
  }
}

// GET /api/students/update-stats - Update stats for all students
export async function GET() {
  try {
    const students = await db.student.findMany();
    const results = [];

    for (const student of students) {
      try {
        const stats = await fetchLeetCodeStats(student.leetcodeUsername);
        
        const updatedStudent = await db.student.update({
          where: { id: student.id },
          data: {
            easySolved: stats.easySolved,
            mediumSolved: stats.mediumSolved,
            hardSolved: stats.hardSolved,
            score: stats.score,
            submissionCalendar: stats.submissionCalendar,
            lastUpdated: new Date(),
            isActive: stats.score > 0
          }
        });

        results.push({ studentId: student.id, success: true, data: updatedStudent });
      } catch (error) {
        console.error(`Error updating stats for student ${student.leetcodeUsername}:`, error);
        results.push({ 
          studentId: student.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error updating all student stats:', error);
    return NextResponse.json({ error: 'Failed to update all student stats' }, { status: 500 });
  }
}