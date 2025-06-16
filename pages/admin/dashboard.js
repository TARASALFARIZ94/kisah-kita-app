// pages/admin/dashboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'; // Import Link for navigation
import { jwtDecode } from 'jwt-decode';
import {
  Users, // For User Management
  Plane, // For Trip Analytics
  ClipboardList, // For Rundowns (kept as part of stats, but not quick action)
  Camera, // For Photos (kept as part of stats, but not quick action)
  HelpCircle, // For FAQ Management
  DollarSign, // For Split Bills (kept as part of stats, but not quick action)
  BarChart3, // For Reports (kept as part of stats, but not quick action)
  Settings, // For System Settings (kept as part of quick actions)
  Bell, // For Notifications (kept as part of quick actions)
  MessageSquare // For Content Review (kept as part of quick actions)
} from 'lucide-react'; // Import necessary icons

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    users: 0,
    trips: 0,
    rundowns: 0,
    photos: 0,
    faqs: 0, // Tambahkan stats untuk FAQs
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
    const checkAuthAndFetchStats = async () => {
      setLoading(true);

      const token = localStorage.getItem('authToken');

      if (!token) {
        router.push('/login');
        return;
      }

      let userRole = null;
      try {
        const decodedToken = jwtDecode(token);
        userRole = decodedToken.role;

        if (userRole !== 'ADMIN') {
          alert('You do not have permission to access this page.');
          router.push('/');
          return;
        }

        // Opsional: Validasi token ke backend jika diperlukan (misal: `/api/verify-token`)
        const verifyRes = await fetch('/api/verify-token', { // Pastikan endpoint ini ada
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!verifyRes.ok) {
          localStorage.removeItem('authToken');
          router.push('/login');
          return;
        }

      } catch (err) {
        console.error('Token decoding or verification failed:', err);
        localStorage.removeItem('authToken');
        router.push('/login');
        return;
      }

      try {
        // Fetch semua data yang dibutuhkan untuk statistik
        const [userRes, tripRes, rundownRes, photoRes, faqRes] = await Promise.all([
          fetch('/api/user', { headers: { 'Authorization': `Bearer ${token}` }}),
          fetch('/api/trip', { headers: { 'Authorization': `Bearer ${token}` }}), // Asumsi ini mengambil SEMUA trip
          fetch('/api/rundown', { headers: { 'Authorization': `Bearer ${token}` }}), // Asumsi ini mengambil SEMUA rundown
          fetch('/api/photo', { headers: { 'Authorization': `Bearer ${token}` }}), // Asumsi ini mengambil SEMUA photo
          fetch('/api/faqs', { headers: { 'Authorization': `Bearer ${token}` }}), // Ambil FAQs
        ]);

        if (!userRes.ok || !tripRes.ok || !rundownRes.ok || !photoRes.ok || !faqRes.ok) {
          if (userRes.status === 401 || tripRes.status === 401 || rundownRes.status === 401 || photoRes.status === 401 || faqRes.status === 401) {
              localStorage.removeItem('authToken');
              router.push('/login');
              return;
          }
          throw new Error('Failed to fetch data from one or more endpoints');
        }

        const users = await userRes.json();
        const trips = await tripRes.json();
        const rundowns = await rundownRes.json();
        const photos = await photoRes.json();
        const faqs = await faqRes.json(); // Data FAQs

        setStats({
          users: Array.isArray(users) ? users.length : 0,
          trips: Array.isArray(trips) ? trips.length : 0,
          rundowns: Array.isArray(rundowns) ? rundowns.length : 0,
          photos: Array.isArray(photos) ? photos.length : 0,
          faqs: Array.isArray(faqs) ? faqs.length : 0, // Set jumlah FAQs
        });
      } catch (apiError) {
        console.error('Failed to fetch stats:', apiError);
        setError(apiError.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchStats();
  }, [router]); 

  const statItems = [
    {
      label: 'Total Users',
      value: stats.users,
      icon: '👥',
      changeType: 'positive', // Anda bisa menambahkan logika perubahan jika ada data historis
      change: '+0%' // Placeholder
    },
    {
      label: 'Total Trips', // Label lebih umum untuk admin
      value: stats.trips,
      icon: '✈️',
      changeType: 'positive',
      change: '+0%'
    },
    {
      label: 'Total Rundowns', // Label lebih umum
      value: stats.rundowns,
      icon: '📋',
      changeType: 'positive',
      change: '+0%'
    },
    {
      label: 'Total Photos', // Label lebih umum
      value: stats.photos,
      icon: '📸',
      changeType: 'positive',
      change: '+0%'
    },
    {
      label: 'Total FAQs', // Item statistik untuk FAQs
      value: stats.faqs,
      icon: '❓', // Ikon untuk FAQ
      changeType: 'positive',
      change: '+0%'
    },
  ];

  // Quick Actions yang disederhanakan dan terhubung ke Link
  const quickActions = [
    { label: 'User Management', icon: <Users size={24} />, path: '/admin/users' },
    { label: 'Trip Management', icon: <Plane size={24} />, path: '/admin/trips' }, // Ubah ke Trip Management
    { label: 'FAQ Management', icon: <HelpCircle size={24} />, path: '/admin/faqs' }, // Tambahkan FAQ Management
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8"> {/* Adjusted grid-cols to 5 for FAQ stat */}
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
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xl">
            <h3 className="text-xl font-bold text-black mb-6 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-black to-gray-600 rounded-full mr-3"></span>
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Adjusted grid-cols */}
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.path} // Use Link to navigate
                  className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl flex flex-col items-center justify-center text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-gray-200 to-gray-300 group-hover:from-gray-300 group-hover:to-gray-400 rounded-lg flex items-center justify-center transition-all duration-200 border border-gray-300">
                    <span className="text-xl text-gray-800 group-hover:text-black transition-colors">{action.icon}</span> {/* Use action.icon directly as JSX */}
                  </div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">
                    {action.label}
                  </p>
                </Link>
              ))}
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
          <p>&copy; {new Date().getFullYear()} Friends Trip Admin Dashboard. All Rights Reserved.</p>
        </div>
      </div>
  );
}