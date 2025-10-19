'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, BookOpen, Plus, RefreshCw, CheckCircle, XCircle, ArrowLeft, Users, User } from 'lucide-react';
import Link from 'next/link';
import { Homework, HomeworkStatus } from '@/types';

interface HomeworkWithStatus extends Homework {
  homeworkStatus?: HomeworkStatus[];
}

export default function HomeworkPage() {
  const [homework, setHomework] = useState<HomeworkWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<'teacher' | 'student'>('teacher'); // Mock role - would come from auth
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  
  const [newHomework, setNewHomework] = useState({
    title: '',
    link: '',
    difficulty: '',
    assignedBy: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchHomework();
    fetchStudents();
  }, []);

  const fetchHomework = async () => {
    try {
      const response = await fetch('/api/homework');
      if (response.ok) {
        const data = await response.json();
        setHomework(data);
      }
    } catch (error) {
      console.error('Error fetching homework:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleAddHomework = async () => {
    if (!newHomework.title || !newHomework.link || !newHomework.difficulty || !newHomework.assignedBy || !newHomework.dueDate) {
      return;
    }

    try {
      const response = await fetch('/api/homework', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newHomework),
      });

      if (response.ok) {
        setNewHomework({ title: '', link: '', difficulty: '', assignedBy: '', dueDate: '' });
        setIsAddDialogOpen(false);
        fetchHomework();
      }
    } catch (error) {
      console.error('Error adding homework:', error);
    }
  };

  const handleUpdateHomeworkStatus = async (studentId: string, homeworkId: string, status: 'SOLVED' | 'NOT_SOLVED') => {
    try {
      const response = await fetch('/api/homework/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, homeworkId, status }),
      });

      if (response.ok) {
        fetchHomework();
      }
    } catch (error) {
      console.error('Error updating homework status:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HARD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHomeworkStatusForStudent = (homeworkItem: HomeworkWithStatus, studentId: string) => {
    const status = homeworkItem.homeworkStatus?.find(s => s.studentId === studentId);
    return status?.status || 'NOT_SOLVED';
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getStudentHomeworkStatus = async (studentId: string) => {
    try {
      const response = await fetch(`/api/homework/status/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Error fetching student homework status:', error);
    }
    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Homework Management</h1>
                <p className="text-sm text-muted-foreground">
                  {userRole === 'teacher' ? 'Assign and track homework' : 'View and complete your homework'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setUserRole(userRole === 'teacher' ? 'student' : 'teacher')}
                variant="outline"
                size="sm"
              >
                {userRole === 'teacher' ? <User className="h-4 w-4 mr-2" /> : <Users className="h-4 w-4 mr-2" />}
                Switch to {userRole === 'teacher' ? 'Student' : 'Teacher'} View
              </Button>
              {userRole === 'teacher' && (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Homework
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Homework</DialogTitle>
                      <DialogDescription>
                        Assign a new LeetCode problem to students.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <Input
                          id="title"
                          value={newHomework.title}
                          onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="link" className="text-right">
                          LeetCode Link
                        </Label>
                        <Input
                          id="link"
                          value={newHomework.link}
                          onChange={(e) => setNewHomework({ ...newHomework, link: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="difficulty" className="text-right">
                          Difficulty
                        </Label>
                        <Select onValueChange={(value) => setNewHomework({ ...newHomework, difficulty: value })}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EASY">Easy</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HARD">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="assignedBy" className="text-right">
                          Assigned By
                        </Label>
                        <Input
                          id="assignedBy"
                          value={newHomework.assignedBy}
                          onChange={(e) => setNewHomework({ ...newHomework, assignedBy: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">
                          Due Date
                        </Label>
                        <Input
                          id="dueDate"
                          type="datetime-local"
                          value={newHomework.dueDate}
                          onChange={(e) => setNewHomework({ ...newHomework, dueDate: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddHomework}>Add Homework</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Student Selector for Student View */}
        {userRole === 'student' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Student</CardTitle>
              <CardDescription>Choose a student to view their homework</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} (@{student.leetcodeUsername})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Homework List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {userRole === 'teacher' ? 'All Homework' : 'My Homework'}
            </CardTitle>
            <CardDescription>
              {userRole === 'teacher' ? 'Manage all assigned homework' : 'View and complete your assigned homework'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {homework.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-semibold mb-2">No homework assigned</p>
                  <p>{userRole === 'teacher' ? 'Start by adding some homework assignments.' : 'Check back later for new assignments.'}</p>
                </div>
              ) : (
                homework.map((hw, index) => (
                  <motion.div
                    key={hw.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{hw.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          <a href={hw.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            View Problem
                          </a>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getDifficultyColor(hw.difficulty)}>
                            {hw.difficulty}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(hw.dueDate).toLocaleDateString()}
                          </div>
                          {isOverdue(hw.dueDate) && (
                            <Badge variant="destructive">Overdue</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {userRole === 'teacher' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Assigned by: {hw.assignedBy}
                          </span>
                        </div>
                      ) : (
                        selectedStudentId && (
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleUpdateHomeworkStatus(selectedStudentId, hw.id, 'SOLVED')}
                              variant={getHomeworkStatusForStudent(hw, selectedStudentId) === 'SOLVED' ? 'default' : 'outline'}
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Solved
                            </Button>
                            <Button
                              onClick={() => handleUpdateHomeworkStatus(selectedStudentId, hw.id, 'NOT_SOLVED')}
                              variant={getHomeworkStatusForStudent(hw, selectedStudentId) === 'NOT_SOLVED' ? 'default' : 'outline'}
                              size="sm"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Not Solved
                            </Button>
                          </div>
                        )
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