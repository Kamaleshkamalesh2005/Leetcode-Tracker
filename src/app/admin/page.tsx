'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BarChart3, PieChart, TrendingUp, Users, RefreshCw, Target, Calendar } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { Student, Homework, HomeworkStatus } from '@/types';

interface StudentWithUser extends Student {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface HomeworkWithStatus extends Homework {
  homeworkStatus?: HomeworkStatus[];
}

export default function AdminPanel() {
  const [students, setStudents] = useState<StudentWithUser[]>([]);
  const [homework, setHomework] = useState<HomeworkWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, homeworkRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/homework')
      ]);

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }

      if (homeworkRes.ok) {
        const homeworkData = await homeworkRes.json();
        setHomework(homeworkData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyDistribution = () => {
    const totalEasy = students.reduce((acc, s) => acc + s.easySolved, 0);
    const totalMedium = students.reduce((acc, s) => acc + s.mediumSolved, 0);
    const totalHard = students.reduce((acc, s) => acc + s.hardSolved, 0);

    return [
      { name: 'Easy', value: totalEasy, color: '#10B981' },
      { name: 'Medium', value: totalMedium, color: '#F59E0B' },
      { name: 'Hard', value: totalHard, color: '#EF4444' }
    ];
  };

  const getTopPerformers = () => {
    return students.slice(0, 10).map(student => ({
      name: student.name,
      score: student.score,
      easy: student.easySolved,
      medium: student.mediumSolved,
      hard: student.hardSolved
    }));
  };

  const getWeeklyProgress = () => {
    // Mock data for weekly progress - in real app, this would come from submissionCalendar
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      problemsSolved: Math.floor(Math.random() * 20) + 5,
      studentsActive: Math.floor(Math.random() * 15) + 5
    }));
  };

  const getHomeworkCompletionRate = () => {
    if (homework.length === 0) return [];
    
    return homework.map(hw => {
      const totalStudents = students.length;
      const completedStudents = hw.homeworkStatus?.filter(status => status.status === 'SOLVED').length || 0;
      const completionRate = totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0;
      
      return {
        title: hw.title,
        completionRate: Math.round(completionRate),
        difficulty: hw.difficulty
      };
    });
  };

  const difficultyData = getDifficultyDistribution();
  const topPerformers = getTopPerformers();
  const weeklyProgress = getWeeklyProgress();
  const homeworkCompletion = getHomeworkCompletionRate();

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
                <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Analytics and insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">
                {students.filter(s => s.isActive).length} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.reduce((acc, s) => acc + s.easySolved + s.mediumSolved + s.hardSolved, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all students
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.score, 0) / students.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Class average
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Homework</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{homework.length}</div>
              <p className="text-xs text-muted-foreground">
                Assignments created
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="homework">Homework</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Difficulty Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Difficulty Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of problems solved by difficulty
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={difficultyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {difficultyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Weekly Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Weekly Activity
                  </CardTitle>
                  <CardDescription>
                    Problems solved and active students per day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="problemsSolved" stroke="#8884d8" name="Problems Solved" />
                      <Line type="monotone" dataKey="studentsActive" stroke="#82ca9d" name="Active Students" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Students ranked by their performance score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topPerformers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#8884d8" name="Total Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homework" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Homework Completion Rates
                </CardTitle>
                <CardDescription>
                  Completion percentage for each homework assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={homeworkCompletion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completionRate" fill="#82ca9d" name="Completion Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Progress Summary</CardTitle>
                  <CardDescription>
                    Individual student progress breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {students.slice(0, 10).map((student, index) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">@{student.leetcodeUsername}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">E: {student.easySolved}</Badge>
                          <Badge variant="outline">M: {student.mediumSolved}</Badge>
                          <Badge variant="outline">H: {student.hardSolved}</Badge>
                          <Badge variant="default">{student.score}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Class Performance Metrics</CardTitle>
                  <CardDescription>
                    Key performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Class Average Score</span>
                      <span className="font-bold">
                        {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.score, 0) / students.length) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Students</span>
                      <span className="font-bold">{students.filter(s => s.isActive).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Easy Problems</span>
                      <span className="font-bold">{students.reduce((acc, s) => acc + s.easySolved, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Medium Problems</span>
                      <span className="font-bold">{students.reduce((acc, s) => acc + s.mediumSolved, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Hard Problems</span>
                      <span className="font-bold">{students.reduce((acc, s) => acc + s.hardSolved, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Homework Assignments</span>
                      <span className="font-bold">{homework.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}