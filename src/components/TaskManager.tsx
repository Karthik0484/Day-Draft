
import { useState } from 'react';
import { Plus, Calendar, Tag, MoreHorizontal, Check, Clock, AlertCircle, Trash2, Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed' | 'deferred';
  tags: string[];
  deadline?: string;
  created_at: string;
  completed_at?: string;
  user_id: string;
}

const TaskManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    tags: '',
    deadline: '',
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  // Filter tasks based on active tab
  const getFilteredTasks = () => {
    switch (activeTab) {
      case 'active':
        return tasks.filter(task => task.status === 'todo');
      case 'in-progress':
        return tasks.filter(task => task.status === 'in-progress');
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      default:
        return tasks;
    }
  };

  // Get task counts for badges
  const getTaskCounts = () => {
    return {
      all: tasks.length,
      active: tasks.filter(task => task.status === 'todo').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      completed: tasks.filter(task => task.status === 'completed').length,
    };
  };

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'created_at' | 'user_id'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          user_id: user!.id,
          tags: taskData.tags.filter(tag => tag.trim() !== ''),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowNewTaskForm(false);
      setNewTask({ title: '', description: '', tags: '', deadline: '' });
      toast({
        title: "Task created",
        description: "Your task has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'deferred':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>;
      case 'deferred':
        return <Badge variant="destructive">Deferred</Badge>;
      default:
        return <Badge variant="outline">Todo</Badge>;
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    const updates: Partial<Task> = { 
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
    };
    updateTaskMutation.mutate({ id: taskId, updates });
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title.",
        variant: "destructive",
      });
      return;
    }

    const tags = newTask.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description,
      tags,
      deadline: newTask.deadline || undefined,
      status: 'todo',
    });
  };

  const counts = getTaskCounts();
  const filteredTasks = getFilteredTasks();

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-white">Task Management</CardTitle>
              <p className="text-purple-100 mt-2 text-sm sm:text-base">Stay organized and productive with your tasks</p>
            </div>
            <Button 
              onClick={() => setShowNewTaskForm(true)}
              className="bg-white text-purple-600 hover:bg-gray-100 w-full sm:w-auto h-12 sm:h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 h-auto p-1">
          <TabsTrigger value="all" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-1 text-xs sm:text-sm">
            <span>All</span>
            <Badge variant="secondary" className="ml-0 sm:ml-1 text-xs">{counts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-1 text-xs sm:text-sm">
            <span>Active</span>
            <Badge variant="secondary" className="ml-0 sm:ml-1 text-xs">{counts.active}</Badge>
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-1 text-xs sm:text-sm">
            <span>In Progress</span>
            <Badge variant="secondary" className="ml-0 sm:ml-1 text-xs">{counts.inProgress}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-1 text-xs sm:text-sm">
            <span>Completed</span>
            <Badge variant="secondary" className="ml-0 sm:ml-1 text-xs">{counts.completed}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 sm:mt-6">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="w-8 h-8 sm:w-12 sm:h-12" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 text-center">
                  {activeTab === 'all' ? 'No tasks yet' : `No ${activeTab} tasks`}
                </h3>
                <p className="text-gray-500 text-center text-sm sm:text-base">
                  {activeTab === 'all' 
                    ? 'Create your first task to get started!' 
                    : `You don't have any ${activeTab} tasks at the moment.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <button 
                          onClick={() => {
                            const newStatus = task.status === 'completed' ? 'todo' : 
                                           task.status === 'todo' ? 'in-progress' : 'completed';
                            updateTaskStatus(task.id, newStatus);
                          }}
                          className="mt-1 p-2 hover:bg-gray-100 rounded touch-manipulation flex-shrink-0"
                          aria-label={`Mark task as ${task.status === 'completed' ? 'incomplete' : 'complete'}`}
                        >
                          {getStatusIcon(task.status)}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 space-y-2 sm:space-y-0">
                            <h3 className={`font-semibold text-base sm:text-lg truncate ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {task.title}
                            </h3>
                            {getStatusBadge(task.status)}
                          </div>
                          
                          {task.description && (
                            <p className="text-gray-600 mb-3 text-sm sm:text-base">{task.description}</p>
                          )}
                          
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            {/* Tags */}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div className="flex flex-wrap gap-1">
                                  {task.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Deadline */}
                            {task.deadline && (
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>{new Date(task.deadline).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 touch-manipulation"
                          aria-label="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="p-2 touch-manipulation"
                          aria-label="More options"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* New Task Form Modal */}
      {showNewTaskForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <Card className="w-full max-w-md mx-auto max-h-[95vh] overflow-y-auto">
            <CardHeader className="p-4 sm:p-6 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl">Add New Task</CardTitle>
                <button
                  onClick={() => setShowNewTaskForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 touch-manipulation"
                  aria-label="Close form"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleCreateTask} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <Input 
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="h-12 sm:h-10 text-base"
                    placeholder="Enter task title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Textarea 
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="text-base resize-none"
                    placeholder="Enter task description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <Input 
                    type="text"
                    value={newTask.tags}
                    onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                    className="h-12 sm:h-10 text-base"
                    placeholder="Enter tags separated by commas"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline (optional)</label>
                  <Input 
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="h-12 sm:h-10 text-base"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewTaskForm(false)}
                    className="w-full sm:w-auto h-12 sm:h-10"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createTaskMutation.isPending}
                    className="w-full sm:w-auto h-12 sm:h-10"
                  >
                    {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
