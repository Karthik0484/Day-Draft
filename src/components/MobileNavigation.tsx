
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Link as LinkIcon, 
  BookOpen, 
  BarChart3, 
  Search,
  DollarSign
} from 'lucide-react';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: FileText, label: 'Files', path: '/files' },
    { icon: LinkIcon, label: 'Links', path: '/links' },
    { icon: BookOpen, label: 'Logs', path: '/daily-logs' },
    { icon: DollarSign, label: 'Spending', path: '/spending' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Search, label: 'Search', path: '/search' },
  ];

  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path);
    navigate(path);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom shadow-lg">
      {/* First row - Main navigation items */}
      <div className="grid grid-cols-5 gap-1 px-1">
        {navigationItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center py-3 px-1 transition-all duration-200 touch-manipulation min-h-[60px] ${
                isActive 
                  ? 'text-blue-600 bg-blue-50 border-t-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800 active:bg-gray-100'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5 mb-1 flex-shrink-0" />
              <span className="text-xs font-medium truncate leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Second row for remaining items */}
      <div className="grid grid-cols-4 gap-1 px-1 border-t border-gray-100">
        {navigationItems.slice(5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-1 transition-all duration-200 touch-manipulation min-h-[50px] ${
                isActive 
                  ? 'text-blue-600 bg-blue-50 border-t-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800 active:bg-gray-100'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label={item.label}
            >
              <Icon className="w-4 h-4 mb-1 flex-shrink-0" />
              <span className="text-xs font-medium truncate leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;
