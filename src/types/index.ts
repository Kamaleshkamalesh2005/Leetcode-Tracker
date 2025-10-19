import 'next-auth';

export interface Student {
  id: string;
  name: string;
  leetcodeUsername: string;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  score: number;
  lastUpdated: Date;
  submissionCalendar?: string;
  isActive: boolean;
  userId?: string;
}

export interface Homework {
  id: string;
  title: string;
  link: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  assignedBy: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface HomeworkStatus {
  id: string;
  status: 'NOT_SOLVED' | 'SOLVED';
  solvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  studentId: string;
  homeworkId: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      image?: string | null;
    };
  }

  interface User {
    role: string;
  }
}