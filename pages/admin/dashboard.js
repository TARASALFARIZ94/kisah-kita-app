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
      changeType: 'positive'
    },
    { 
      label: 'Active Trips', 
      value: stats.trips, 
      icon: '✈️', 
      changeType: 'positive'
    },
    { 
      label: 'Rundowns', 
      value: stats.rundowns, 
      icon: '📋', 
      changeType: 'positive'
    },
    { 
      label: 'Photos Shared', 
      value: stats.photos, 
      icon: '📸', 
      changeType: 'positive'
    },
    { 
      label: 'Split Bills', 
      value: stats.splitBills, 
      icon: '💰', 
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
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gray-100 border-2 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-black mb-4">Dashboard Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-8 text-white relative overflow-hidden border border-gray-300 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="absolute top-4 right-4 text-xs text-gray-300 font-mono">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Dashboard Overview
              </h2>
              <p className="text-gray-200">Monitor your Friends Trip application performance</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 hover:bg-gray-50 transition-all duration-300 hover:scale-105 border border-gray-200 hover:border-gray-300 shadow-xl hover:shadow-2xl group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 rounded-xl flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-200">
                  <span className="text-2xl grayscale group-hover:grayscale-0 transition-all duration-200">{item.icon}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  item.changeType === 'positive' 
                    ? 'bg-gray-100 border-gray-300 text-gray-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  {item.change}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-black group-hover:text-gray-800 transition-colors">
                  {item.value.toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm font-medium group-hover:text-gray-700 transition-colors">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xl">
              <h3 className="text-xl font-bold text-black mb-6 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-black to-gray-600 rounded-full mr-3"></span>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-gray-200 to-gray-300 group-hover:from-gray-300 group-hover:to-gray-400 rounded-lg flex items-center justify-center transition-all duration-200 border border-gray-300">
                        <span className="text-xl grayscale group-hover:grayscale-0 transition-all duration-200">{action.icon}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">
                        {action.label}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xl">
            <h3 className="text-xl font-bold text-black mb-4 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-gray-600 to-gray-400 rounded-full mr-3"></span>
              System Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-700 font-medium">Server Status</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse"></div>
                  <span className="text-gray-800 text-sm">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-700 font-medium">Database</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                  <span className="text-gray-800 text-sm">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-700 font-medium">API</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                  <span className="text-gray-800 text-sm">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>&copy; 2025 Trip Friends Admin Dashboard. Made with 🤍</p>
        </div>
      </div>
    </div>
  );
}