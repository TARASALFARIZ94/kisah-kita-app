import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plane, // Untuk Trip Planning
  ClipboardList, // Untuk Rundown Management (not used in stats, but good for layout)
  DollarSign, // Untuk Split Bills
  Camera, // Untuk Photo Gallery (not used in stats, but good for layout)
  User, // Untuk profil user
  Settings, // Untuk pengaturan (jika ada)
  Calendar, // Untuk event atau tanggal
  Info, // Untuk informasi umum
  LogOut, // Untuk logout
  ArrowRight // Untuk tombol "Go to..."
} from 'lucide-react';

import UserLayout from '@/components/layout/UserLayout'; // Import UserLayout

// Fungsi untuk mendapatkan token dari localStorage
// Ini harus dipanggil hanya di sisi klien
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

const UserDashboard = () => {
  // State untuk menyimpan data yang diambil dari API
  const [upcomingTripsCount, setUpcomingTripsCount] = useState(0);
  const [unsettledBillsCount, setUnsettledBillsCount] = useState(0);

  // Data pengguna yang login akan diambil dari token di sidebar, tidak perlu di sini lagi
  const userData = {
    name: 'User Dashboard', // Tetap sebagai placeholder visual jika tidak diambil dari tempat lain
    email: 'dashboard@example.com',
  };

  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil jumlah data dari API
  const fetchCounts = async () => {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      // Jika tidak ada token, set default dan keluar
      setUpcomingTripsCount(0);
      setUnsettledBillsCount(0);
      setLoading(false);
      // Opsional: Redirect ke halaman login jika token tidak ada
      // router.push('/login');
      return;
    }

    try {
      // --- Fetch Upcoming Trips Count ---
      const tripsRes = await fetch('/api/user/trips', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (tripsRes.ok) {
        const tripsData = await tripsRes.json();
        // Filter trip yang startDate-nya di masa depan
        const now = new Date();
        const upcoming = tripsData.filter(trip => new Date(trip.startDate) > now);
        setUpcomingTripsCount(upcoming.length);
      } else {
        console.error("Failed to fetch trips for count:", await tripsRes.json());
        setUpcomingTripsCount(0);
      }
    } catch (error) {
      console.error("Error fetching dashboard counts:", error);
      setUpcomingTripsCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []); // Jalankan sekali saat komponen dimuat

  if (loading) {
    return (
      <UserLayout> {/* Pastikan UserLayout membungkus loader juga */}
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout> {/* Bungkus seluruh konten dengan UserLayout */}
      <main className="p-6 md:p-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {userData.name}!</h1>
          <p className="text-gray-600">Your adventure hub is here. Ready to plan your next trip?</p>
        </div>

        {/* Quick Stats / Overview */}
        <div className="grid grid-cols-1 gap-6 mb-12"> {/* Hanya 2 kolom */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
                <div>
                    <p className="text-lg font-bold text-black">Upcoming Trips</p>
                    </div>
                
                <div className="flex items-center gap-2"> {/* Tambahkan flex container untuk angka dan ikon */}
                    <h2 className="text-3xl font-bold text-gray-900">{upcomingTripsCount}</h2> {/* Angka di sini */}
                    <Plane size={48} className="text-gray-400 opacity-30" />
                </div>
                </div>
        </div>

        {/* Feature Sections - Tetap sama */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card: My Trips */}
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

          {/* Card: Trip Rundowns */}
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

          {/* Card: Split Bills */}
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

          {/* Card: Photo Gallery */}
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

          {/* Card: Account Settings (optional) */}
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

           {/* Card: Help & Support (optional) */}
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

      {/* Footer (dipindahkan ke sini jika tidak di handle oleh _app.js) */}
      <footer className="py-10 px-6 bg-black text-gray-400 text-center text-sm mt-12">
        <div className="max-w-6xl mx-auto">
          <p>&copy; {new Date().getFullYear()} Friends Trip. All Rights Reserved.</p>
          <div className="mt-4 space-x-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </UserLayout>
  );
};

export default UserDashboard;
