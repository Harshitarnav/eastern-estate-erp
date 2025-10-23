/**
 * @file sales/tasks/page.tsx
 * @description Tasks Management - Personal task scheduler for sales activities
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { salesTasksService } from '@/services/sales-tasks.service';
import { SalesTask, TaskStatus } from '@/types/sales-crm.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  CheckCircle2, 
  Clock,
  ListTodo,
  Phone,
  Video,
  Users,
  MapPin,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

export default function TasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<SalesTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'pending' | 'completed'>('pending');

  useEffect(() => {
    if (user?.id) {
      loadTasks();
    }
  }, [user?.id]);

  const loadTasks = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await salesTasksService.findByUser(user.id);
      const sorted = Array.isArray(data)
        ? [...data].sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          )
        : [];
      setTasks(sorted);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await salesTasksService.updateStatus(taskId, TaskStatus.COMPLETED);
      await loadTasks();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to complete task');
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!confirm(`Delete task "${title}"?`)) return;
    
    try {
      await salesTasksService.remove(taskId);
      await loadTasks();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'FOLLOWUP_CALL': return <Phone className="h-5 w-5" />;
      case 'SITE_VISIT': return <MapPin className="h-5 w-5" />;
      case 'CLIENT_MEETING': return <Users className="h-5 w-5" />;
      case 'MEETING': return <Video className="h-5 w-5" />;
      case 'INTERNAL_MEETING': return <Video className="h-5 w-5" />;
      default: return <ListTodo className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = ((tasks || [])).filter(task => {
    const taskDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'today':
        return taskDate.toDateString() === today.toDateString();
      case 'pending':
        return task.status === TaskStatus.PENDING;
      case 'completed':
        return task.status === TaskStatus.COMPLETED;
      default:
        return true;
    }
  });

  const stats = {
    total: (tasks || []).length,
    today: ((tasks || [])).filter(t => new Date(t.dueDate).toDateString() === new Date().toDateString()).length,
    pending: ((tasks || [])).filter(t => t.status === TaskStatus.PENDING).length,
    completed: ((tasks || [])).filter(t => t.status === TaskStatus.COMPLETED).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadTasks}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your daily sales activities and meetings</p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-purple-600"
          onClick={() => router.push('/sales/tasks/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ListTodo className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Tasks</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('today')}
              >
                Today
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Completed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {(filteredTasks || []).length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <ListTodo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No tasks found</p>
              <p className="text-gray-500 text-sm mt-2">
                {filter !== 'all' ? 'Try adjusting your filters' : 'Start by adding your first task'}
              </p>
            </CardContent>
          </Card>
        ) : (
          ((filteredTasks || [])).map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        task.status === 'COMPLETED' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {getTaskIcon(task.taskType)}
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <Badge className={getPriorityColor(task.priority)} variant="outline">
                          {task.priority}
                        </Badge>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-gray-600">{task.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                            {task.dueTime && ` at ${task.dueTime}`}
                          </span>
                        </div>
                        {task.taskType && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">
                              Type: <span className="font-medium">{task.taskType.replace(/_/g, ' ')}</span>
                            </span>
                          </div>
                        )}
                        {task.estimatedDurationMinutes && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{task.estimatedDurationMinutes} min</span>
                          </div>
                        )}
                      </div>

                      {task.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{task.location}</span>
                        </div>
                      )}

                    {task.leadId && (
                      <Link
                        href={`/leads/${task.leadId}`}
                        className="text-xs font-semibold text-[#A8211B] hover:underline"
                      >
                        View Lead
                      </Link>
                    )}

                    {task.meetingLink && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                          <a 
                            href={task.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                          >
                            <Video className="h-4 w-4" />
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {task.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteTask(task.id)}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTask(task.id, task.title)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

