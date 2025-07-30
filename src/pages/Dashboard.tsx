
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import TaskManager from '@/components/TaskManager';
import PerformanceChart from '@/components/PerformanceChart';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardStats from '@/components/DashboardStats';
import RecentActivity from '@/components/RecentActivity';

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch user tasks
  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user files
  const { data: files = [] } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user links
  const { data: links = [] } = useQuery({
    queryKey: ['links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch spending logs
  const { data: spendingLogs = [] } = useQuery({
    queryKey: ['spending-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spending_logs')
        .select('*')
        .order('spend_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          refetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
    };
  }, [user, refetchTasks]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            Welcome back, {user.user_metadata?.full_name || user.email}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3">
            Here's what's happening with your productivity today.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-6 sm:mb-8">
          <DashboardStats tasks={tasks} files={files} links={links} spendingLogs={spendingLogs} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Task Manager */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Quick Task Management
              </h2>
              <TaskManager />
            </div>
          </div>

          {/* Right Column - Activity & Performance */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <RecentActivity tasks={tasks} files={files} links={links} />
            <PerformanceChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
