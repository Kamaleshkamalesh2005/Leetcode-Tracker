'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Search, UserX, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Student } from '@/types';

interface StudentWithUser extends Student {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export default function InactiveStudentsPage() {
  const [students, setStudents] = useState<StudentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInactiveStudents();
  }, []);

  const fetchInactiveStudents = async () => {
    try {
      const response = await fetch('/api/students/inactive');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching inactive students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStats = async (studentId: string) => {
    try {
      const response = await fetch('/api/students/update-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      });

      if (response.ok) {
        fetchInactiveStudents();
      }
    } catch (error) {
      console.error('Error updating student stats:', error);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.leetcodeUsername.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInactiveReason = (student: StudentWithUser) => {
    if (student.score === 0) {
      return 'No problems solved';
    }
    
    if (!student.submissionCalendar) {
      return 'No activity data available';
    }
    
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const oneWeekAgoTimestamp = Math.floor(oneWeekAgo.getTime() / 1000);
      
      const calendar = JSON.parse(student.submissionCalendar);
      
      // Check if there are any submissions in the last week
      const hasRecentActivity = Object.keys(calendar).some(timestamp => {
        const ts = parseInt(timestamp);
        return ts >= oneWeekAgoTimestamp;
      });
      
      if (!hasRecentActivity) {
        return 'No activity this week';
      }
      
      return 'Low activity';
    } catch (error) {
      console.error('Error parsing submission calendar:', error);
      return 'Activity data error';
    }
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
                <h1 className="text-2xl font-bold text-foreground">Inactive Students</h1>
                <p className="text-sm text-muted-foreground">Students with no recent activity</p>
              </div>
            </div>
            <Button onClick={fetchInactiveStudents} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Alert */}
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            These students have either solved 0 problems or haven't been active in the last week. 
            Consider reaching out to encourage their participation.
          </AlertDescription>
        </Alert>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Never Solved Problems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.filter(s => s.score === 0).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => {
                  if (s.score === 0) return true;
                  if (!s.submissionCalendar) return true;
                  
                  try {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    const oneWeekAgoTimestamp = Math.floor(oneWeekAgo.getTime() / 1000);
                    
                    const calendar = JSON.parse(s.submissionCalendar);
                    
                    const hasRecentActivity = Object.keys(calendar).some(timestamp => {
                      const ts = parseInt(timestamp);
                      return ts >= oneWeekAgoTimestamp;
                    });
                    
                    return !hasRecentActivity;
                  } catch (error) {
                    return true;
                  }
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search inactive students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Inactive Students List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5" />
              Inactive Students List
            </CardTitle>
            <CardDescription>
              Students who need attention and encouragement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {students.length === 0 ? (
                    <div>
                      <p className="text-lg font-semibold mb-2">Great job!</p>
                      <p>All students are active and engaged.</p>
                    </div>
                  ) : (
                    <p>No inactive students match your search criteria.</p>
                  )}
                </div>
              ) : (
                filteredStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border bg-red-50 border-red-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8">
                        <UserX className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">@{student.leetcodeUsername}</p>
                        <Badge variant="destructive" className="mt-1">
                          {getInactiveReason(student)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          Easy: {student.easySolved}
                        </Badge>
                        <Badge variant="outline">
                          Medium: {student.mediumSolved}
                        </Badge>
                        <Badge variant="outline">
                          Hard: {student.hardSolved}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{student.score}</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                      <Button
                        onClick={() => handleUpdateStats(student.id)}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
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