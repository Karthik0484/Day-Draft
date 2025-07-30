
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Link as LinkIcon, 
  BookOpen, 
  BarChart3, 
  Search,
  DollarSign,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import MobileNavigation from './MobileNavigation';

const DashboardHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-4 sm:space-x-8">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                ProductivityHub
              </h1>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex space-x-1">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                
                <button
                  onClick={() => navigate('/tasks')}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Tasks</span>
                </button>
                
                <button
                  onClick={() => navigate('/calendar')}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Calendar</span>
                </button>
                
                <button
                  onClick={() => navigate('/files')}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Files</span>
                </button>
                
                <button
                  onClick={() => navigate('/links')}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Links</span>
                </button>
                
                <button
                  onClick={() => navigate('/daily-logs')}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Daily Logs</span>
                </button>

                <button
                  onClick={() => navigate('/spending')}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Spending</span>
                </button>
                
                <button
                  onClick={() => navigate('/analytics')}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </button>
                
                <button
                  onClick={() => navigate('/search')}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md touch-manipulation"
                aria-label="Toggle mobile menu"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-700">
                <User className="w-4 h-4" />
                <span className="truncate max-w-32">
                  {user?.user_metadata?.full_name || user?.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors touch-manipulation"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="lg:hidden border-t border-gray-200 py-3 bg-white">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className="flex items-center space-x-2 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md touch-manipulation"
                >
                  <Home className="w-4 h-4 flex-shrink-0" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => handleNavigation('/tasks')}
                  className="flex items-center space-x-2 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md touch-manipulation"
                >
                  <CheckSquare className="w-4 h-4 flex-shrink-0" />
                  <span>Tasks</span>
                </button>
                <button
                  onClick={() => handleNavigation('/calendar')}
                  className="flex items-center space-x-2 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md touch-manipulation"
                >
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Calendar</span>
                </button>
                <button
                  onClick={() => handleNavigation('/files')}
                  className="flex items-center space-x-2 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md touch-manipulation"
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span>Files</span>
                </button>
                <button
                  onClick={() => handleNavigation('/links')}
                  className="flex items-center space-x-2 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md touch-manipulation"
                >
                  <LinkIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Links</span>
                </button>
                <button
                  onClick={() => handleNavigation('/daily-logs')}
                  className="flex items-center space-x-2 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md touch-manipulation"
                >
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span>Daily Logs</span>
                </button>
                <button
                  onClick={() => handleNavigation('/spending')}
                  className="flex items-center space-x-2 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md touch-manipulation"
                >
                  <DollarSign className="w-4 h-4 flex-shrink-0" />
                  <span>Spending</span>
                </button>
                <button
                  onClick={() => handleNavigation('/analytics')}
                  className="flex items-center space-x-2 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md touch-manipulation"
                >
                  <BarChart3 className="w-4 h-4 flex-shrink-0" />
                  <span>Analytics</span>
                </button>
                <button
                  onClick={() => handleNavigation('/search')}
                  className="flex items-center space-x-2 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md touch-manipulation sm:col-span-3"
                >
                  <Search className="w-4 h-4 flex-shrink-0" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </>
  );
};

export default DashboardHeader;
