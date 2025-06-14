// pages/dashboard.jsx atau pages/user/dashboard.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'; // Menggunakan next/router untuk Pages Router
import { jwtDecode } from 'jwt-decode'; // Pastikan Anda sudah menginstal 'jwt-decode'
import {
  Plane, // Untuk Trip Planning
  ClipboardList, // Untuk Rundown Management
  DollarSign, // Untuk Split Bills
  Camera, // Untuk Photo Gallery
  User, // Untuk profil user (digunakan di sini)
  Settings, // Untuk pengaturan (jika ada)
  Calendar, // Untuk event atau tanggal
  Info, // Untuk informasi umum
  LogOut, // Untuk logout
  ArrowRight // Untuk ikon panah, jika Anda menggunakannya
} from 'lucide-react'; // Sesuaikan dengan library ikon Anda

const UserDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const [upcomingTrips, setUpcomingTrips] = useState(0);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [unsettledBills, setUnsettledBills] = useState(0);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');

      if (!token) {
        router.push('/login');
        return;
      }

      let decodedPayload = null;
      try {
        decodedPayload = jwtDecode(token);

        if (decodedPayload.exp * 1000 < Date.now()) {
          console.warn('Token expired. Redirecting to login.');
          localStorage.removeItem('authToken');
          router.push('/login');
          return;
        }

        if (decodedPayload.role !== 'USER') {
          console.warn('Unauthorized role detected for USER dashboard. Redirecting.');
          if (decodedPayload.role === 'ADMIN') {
            router.push('/admin-dashboard');
          } else {
            router.push('/');
          }
          return;
        }

        setLoggedInUser({
          id: decodedPayload.userId,
          name: decodedPayload.name || decodedPayload.email.split('@')[0],
          email: decodedPayload.email,
          initials: (decodedPayload.name ? decodedPayload.name.split(' ').map(n => n[0]).join('') : decodedPayload.email[0]).toUpperCase(),
          role: decodedPayload.role
        });

        setUpcomingTrips(3);
        setTotalPhotos(125);
        setUnsettledBills(2);

      } catch (err) {
        console.error('Authentication/Authorization error in UserDashboard:', err);
        localStorage.removeItem('authToken');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  const handleLogout = () => {
  // Tampilkan dialog konfirmasi
  const isConfirmed = window.confirm('Are you sure you want to log out?');

    // Jika pengguna mengklik "OK" pada dialog konfirmasi
    if (isConfirmed) {
      localStorage.removeItem('authToken'); // Hapus token
      router.push('/'); // Redirect ke halaman login
    }
    // Jika pengguna mengklik "Batal", tidak ada yang terjadi
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center">
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
          <h2 className="text-2xl font-bold text-black mb-4">Akses Ditolak</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  if (!loggedInUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-900 font-sans">
      <nav className="bg-white/80 backdrop-blur-sm shadow-md py-4 px-6 md:px-12 flex justify-between items-center rounded-b-xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-base">FT</span>
          </div>
          <span className="font-bold text-xl text-gray-900">Friends Trip</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center">
              {loggedInUser.avatar ? (
                <img src={loggedInUser.avatar} alt={loggedInUser.name} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <span className="text-gray-600 font-medium text-sm">{loggedInUser.initials}</span>
              )}
            </div>
            <span className="font-medium text-gray-800 hidden sm:block">{loggedInUser.name}</span>
          </div>
          {/* Logout Button in Navbar - Tanpa <a> */}
          <Link href="/login" onClick={handleLogout} className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors">
            <LogOut size={20} />
          </Link>
        </div>
      </nav>

      <main className="p-6 md:p-12">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {loggedInUser.name}!</h1>
          <p className="text-gray-600">Your adventure hub is here. Ready to plan your next trip?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Upcoming Trips</p>
              <h2 className="text-3xl font-bold text-gray-900">{upcomingTrips}</h2>
            </div>
            <Plane size={48} className="text-gray-400 opacity-30" />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Photos Shared</p>
              <h2 className="text-3xl font-bold text-gray-900">{totalPhotos}</h2>
            </div>
            <Camera size={48} className="text-gray-400 opacity-30" />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unsettled Bills</p>
              <h2 className="text-3xl font-bold text-gray-900">{unsettledBills}</h2>
            </div>
            <DollarSign size={48} className="text-gray-400 opacity-30" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card: My Trips - Tanpa <a> */}
          <Link href="/user/trips" className="block bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
            <div className="p-4 bg-gray-200 rounded-full inline-flex mb-4">
              <Plane size={32} className="text-gray-800" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">My Trips</h3>
            <p className="text-gray-600 mb-4">View, create, and manage all your travel plans.</p>
            <span className="text-gray-800 font-medium flex items-center group">
              Go to Trips <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* Card: Trip Rundowns - Tanpa <a> */}
          <Link href="/user/rundowns" className="block bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
            <div className="p-4 bg-gray-300 rounded-full inline-flex mb-4">
              <ClipboardList size={32} className="text-gray-800" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Trip Rundowns</h3>
            <p className="text-gray-600 mb-4">Organize your itinerary, activities, and schedules.</p>
            <span className="text-gray-800 font-medium flex items-center group">
              Go to Rundowns <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* Card: Split Bills - Tanpa <a> */}
          <Link href="/user/splitbills" className="block bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
            <div className="p-4 bg-gray-400 rounded-full inline-flex mb-4">
              <DollarSign size={32} className="text-gray-900" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Split Bills</h3>
            <p className="text-gray-600 mb-4">Easily track and settle shared expenses with friends.</p>
            <span className="text-gray-800 font-medium flex items-center group">
              Go to Split Bills <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* Card: Photo Gallery - Tanpa <a> */}
          <Link href="/user/photos" className="block bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
            <div className="p-4 bg-gray-500 rounded-full inline-flex mb-4">
              <Camera size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Photo Gallery</h3>
            <p className="text-gray-600 mb-4">Upload, view, and share all your trip memories.</p>
            <span className="text-gray-800 font-medium flex items-center group">
              Go to Photos <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* Card: Account Settings (optional) - Tanpa <a> */}
          <Link href="/user/settings" className="block bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
            <div className="p-4 bg-gray-600 rounded-full inline-flex mb-4">
              <Settings size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Settings</h3>
            <p className="text-gray-600 mb-4">Manage your profile, preferences, and security settings.</p>
            <span className="text-gray-800 font-medium flex items-center group">
              Manage Settings <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* Card: Help & Support (optional) - Tanpa <a> */}
          <Link href="/user/help" className="block bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
            <div className="p-4 bg-gray-700 rounded-full inline-flex mb-4">
              <Info size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Help & Support</h3>
            <p className="text-gray-600 mb-4">Find answers to your questions and get assistance.</p>
            <span className="text-gray-800 font-medium flex items-center group">
              Get Help <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </main>

      <footer className="py-10 px-6 bg-black text-gray-400 text-center text-sm mt-12">
        <div className="max-w-6xl mx-auto">
          <p>&copy; {new Date().getFullYear()} Friends Trip. All Rights Reserved.</p>
          <div className="mt-4 space-x-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;