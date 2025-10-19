'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AuthNav } from '@/components/auth-nav';
import { Student } from '@/types';
import { UserPlus, RefreshCw, Trophy, Medal } from 'lucide-react';
import Link from 'next/link';

interface StudentWithUser extends Student {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export default function Home() {
  const { data: session, status } = useSession();
  const [students, setStudents] = useState<StudentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', leetcodeUsername: '' });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStudents();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const fetchStudents = async () => {
    try {
      console.log('Fetching students...');
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched students:', data);
        setStudents(data);
      } else {
        console.error('Failed to fetch students:', response.status);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.leetcodeUsername) return;

    try {
      console.log('Adding student:', newStudent);
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
      });

      if (response.ok) {
        console.log('Student added successfully');
        setNewStudent({ name: '', leetcodeUsername: '' });
        setIsAddDialogOpen(false);
        fetchStudents();
      } else {
        console.error('Failed to add student:', response.status);
      }
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleUpdateStats = async (studentId: string) => {
    try {
      console.log('Updating stats for student:', studentId);
      const response = await fetch('/api/students/update-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      });

      if (response.ok) {
        console.log('Stats updated successfully');
        fetchStudents();
      } else {
        console.error('Failed to update stats:', response.status);
      }
    } catch (error) {
      console.error('Error updating student stats:', error);
    }
  };

  const handleUpdateAllStats = async () => {
    try {
      console.log('Updating stats for all students');
      const response = await fetch('/api/students/update-stats');
      if (response.ok) {
        console.log('All stats updated successfully');
        fetchStudents();
      } else {
        console.error('Failed to update all stats:', response.status);
      }
    } catch (error) {
      console.error('Error updating all stats:', error);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-semibold">{index + 1}</span>;
  };

  const getRankClass = (index: number) => {
    if (index === 0) return 'bg-yellow-50 border-yellow-200';
    if (index === 1) return 'bg-gray-50 border-gray-200';
    if (index === 2) return 'bg-amber-50 border-amber-200';
    return '';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">LeetCode Classroom Tracker</CardTitle>
            <CardDescription>
              Please sign in to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/auth/signin'} size="lg">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canManageStudents = session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">LeetCode Classroom Tracker</h1>
              <p className="text-sm text-muted-foreground">Track student progress and rankings</p>
            </div>
            <div className="flex items-center gap-4">
              {canManageStudents && (
                <>
                  <Button onClick={handleUpdateAllStats} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update All Stats
                  </Button>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Student
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                        <DialogDescription>
                          Enter the student's name and LeetCode username to add them to the tracker.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={newStudent.name}
                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="leetcode" className="text-right">
                            LeetCode Username
                          </Label>
                          <Input
                            id="leetcode"
                            value={newStudent.leetcodeUsername}
                            onChange={(e) => setNewStudent({ ...newStudent, leetcodeUsername: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddStudent}>Add Student</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              <AuthNav />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <Trophy className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/homework" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600">
              <Trophy className="h-4 w-4" />
              Homework
            </Link>
            {canManageStudents && (
              <>
                <Link href="/inactive-students" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600">
                  <Trophy className="h-4 w-4" />
                  Inactive Students
                </Link>
                <Link href="/admin" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600">
                  <Trophy className="h-4 w-4" />
                  Admin Panel
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.filter(s => s.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.score, 0) / students.length) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Student Leaderboard
            </CardTitle>
            <CardDescription>
              Students ranked by their LeetCode performance score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students found. Add some students to get started!
                </div>
              ) : (
                students.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg border ${getRankClass(index)}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8">
                        {getRankIcon(index)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">@{student.leetcodeUsername}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          Easy: {student.easySolved}
                        </Badge>
                        <Badge variant="secondary">
                          Medium: {student.mediumSolved}
                        </Badge>
                        <Badge variant="secondary">
                          Hard: {student.hardSolved}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{student.score}</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                      {canManageStudents && (
                        <Button
                          onClick={() => handleUpdateStats(student.id)}
                          variant="outline"
                          size="sm"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}