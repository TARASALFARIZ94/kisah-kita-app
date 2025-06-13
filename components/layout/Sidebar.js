import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { 
  Home, 
  BarChart3, 
  Users, 
  Settings, 
  FileText, 
  Calendar,
  Bell,
  MessageSquare,
  DollarSign,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Camera,
  Plane,
  ClipboardList,
  Shield,
  HelpCircle,
  Database
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('dashboard'); 

  // Mock admin data - replace with actual logged in admin data
  const adminData = {
    name: 'Admin User',
    email: 'admin@friendstrip.com',
    avatar: null, // Set to null to show initials
    initials: 'AU'
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  useEffect(() => {
    const currentPath = router.pathname;
    const foundItem = menuItems.find(item => item.href === currentPath);
    if (foundItem) {
      setActiveItem(foundItem.id);
    } else {
      setActiveItem('dashboard'); 
    }
  }, [router.pathname]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/admin/dashboard' },
    { 
      id: 'users', 
      label: 'User Management', 
      icon: Users, 
      href: '/admin/users',
    },
    { 
      id: 'trips', 
      label: 'Trip Management', 
      icon: Plane, 
      href: '/admin/trips',
    },
    { 
      id: 'rundowns', 
      label: 'Rundowns', 
      icon: ClipboardList, 
      href: '/admin/rundowns', 
    },
    { 
      id: 'photos', 
      label: 'Photo Gallery', 
      icon: Camera, 
      href: '/admin/photos',
    },
  ];

  const handleItemClick = () => {};

  return (
    <div className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col`}>
      
      {/* Header with Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TP</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900 text-base">Friends Trip</span>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">TP</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4 px-3">
              Main Menu
            </p>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href; 
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => handleItemClick()}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Admin Profile Section */}
      <div className="border-t border-gray-100 p-4">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {adminData.avatar ? (
                <img 
                  src={adminData.avatar} 
                  alt={adminData.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-medium text-sm">
                  {adminData.initials}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {adminData.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {adminData.email}
              </p>
            </div>
            <button className="p-1 rounded-md hover:bg-gray-100 transition-colors">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              {adminData.avatar ? (
                <img 
                  src={adminData.avatar} 
                  alt={adminData.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-medium text-xs">
                  {adminData.initials}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout Section */}
      <div className="border-t border-gray-100 p-3">
        <Link
          href="/login" 
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3">
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
            {!isCollapsed && (
              <span className="font-medium text-sm">Logout</span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

const DashboardWithSidebar = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {/* Main content area */}
      </div>
    </div>
  );
};

export default DashboardWithSidebar;