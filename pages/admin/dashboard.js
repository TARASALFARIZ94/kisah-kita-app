// pages/admin/dashboard.js
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    trips: 0,
    rundowns: 0,
    photos: 0,
    splitBills: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [userRes, tripRes, rundownRes, photoRes, billRes] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/trip'),
          fetch('/api/rundown'),
          fetch('/api/photo'),
          fetch('/api/splitbill'),
        ]);

        // Check if all responses are ok
        if (!userRes.ok || !tripRes.ok || !rundownRes.ok || !photoRes.ok || !billRes.ok) {
          throw new Error('Failed to fetch data from one or more endpoints');
        }

        const users = await userRes.json();
        const trips = await tripRes.json();
        const rundowns = await rundownRes.json();
        const photos = await photoRes.json();
        const bills = await billRes.json();

        setStats({
          users: Array.isArray(users) ? users.length : 0,
          trips: Array.isArray(trips) ? trips.length : 0,
          rundowns: Array.isArray(rundowns) ? rundowns.length : 0,
          photos: Array.isArray(photos) ? photos.length : 0,
          splitBills: Array.isArray(bills) ? bills.length : 0
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    { 
      label: 'Total Users', 
      value: stats.users, 
      icon: '👥', 
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20',
      iconBg: 'bg-blue-100',
      textColor: 'text-blue-600',
      change: '+12%',
      changeType: 'positive'
    },
    { 
      label: 'Active Trips', 
      value: stats.trips, 
      icon: '✈️', 
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/20',
      iconBg: 'bg-emerald-100',
      textColor: 'text-emerald-600',
      change: '+8%',
      changeType: 'positive'
    },
    { 
      label: 'Rundowns', 
      value: stats.rundowns, 
      icon: '📋', 
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/20',
      iconBg: 'bg-purple-100',
      textColor: 'text-purple-600',
      change: '+15%',
      changeType: 'positive'
    },
    { 
      label: 'Photos Shared', 
      value: stats.photos, 
      icon: '📸', 
      gradient: 'from-pink-500 to-pink-600',
      shadow: 'shadow-pink-500/20',
      iconBg: 'bg-pink-100',
      textColor: 'text-pink-600',
      change: '+23%',
      changeType: 'positive'
    },
    { 
      label: 'Split Bills', 
      value: stats.splitBills, 
      icon: '💰', 
      gradient: 'from-amber-500 to-amber-600',
      shadow: 'shadow-amber-500/20',
      iconBg: 'bg-amber-100',
      textColor: 'text-amber-600',
      change: '-3%',
      changeType: 'negative'
    },
  ];

  const quickActions = [
    { label: 'User Management', icon: '👤', color: 'blue', path: '/admin/users' },
    { label: 'Trip Analytics', icon: '📊', color: 'green', path: '/admin/trips' },
    { label: 'Content Review', icon: '🔍', color: 'purple', path: '/admin/content' },
    { label: 'System Settings', icon: '⚙️', color: 'gray', path: '/admin/settings' },
    { label: 'Reports', icon: '📄', color: 'indigo', path: '/admin/reports' },
    { label: 'Notifications', icon: '🔔', color: 'red', path: '/admin/notifications' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-6 text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Dashboard Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">TP</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Trip Planner Admin</h1>
                <p className="text-slate-600 text-sm">Welcome back, Administrator</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-800 font-medium">
                {currentTime.toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-slate-600 text-sm">
                {currentTime.toLocaleTimeString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
              <p className="text-blue-100">Monitor your Trip Planner application performance</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {statItems.map((item, index) => (
            <div
              key={index}
              className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:${item.shadow} border border-white/50`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${item.iconBg} rounded-xl flex items-center justify-center`}>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.changeType === 'positive' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {item.change}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-slate-800">{item.value.toLocaleString()}</p>
                <p className="text-slate-600 text-sm font-medium">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-3"></span>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="group p-4 bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:scale-105"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 group-hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors">
                        <span className="text-xl">{action.icon}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 group-hover:text-slate-800">
                        {action.label}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-3"></span>
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                { action: 'New user registered', time: '2 minutes ago', icon: '👋', color: 'blue' },
                { action: 'Trip to Bali created', time: '15 minutes ago', icon: '✈️', color: 'green' },
                { action: 'Photo uploaded', time: '1 hour ago', icon: '📸', color: 'pink' },
                { action: 'Split bill created', time: '2 hours ago', icon: '💰', color: 'amber' },
                { action: 'System backup completed', time: '3 hours ago', icon: '💾', color: 'purple' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">{activity.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-600 text-sm">
          <p>&copy; 2025 Trip Planner Admin Dashboard. Made with ❤️</p>
        </div>
      </div>
    </div>
  );
}