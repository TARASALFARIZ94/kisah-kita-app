import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode'; // Pastikan Anda sudah menginstal 'jwt-decode'

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

  // State untuk menyimpan data admin yang login
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);
  // State untuk loading data sidebar (opsional, tapi bagus untuk UX)
  const [loadingSidebar, setLoadingSidebar] = useState(true);

  // --- LOGIKA UTAMA: Autentikasi dan Mengambil Data Admin ---
  useEffect(() => {
    const fetchAdminData = async () => {
      setLoadingSidebar(true); // Mulai loading

      const token = localStorage.getItem('authToken');

      if (!token) {
        router.push('/login'); // Redirect jika tidak ada token
        return;
      }

      let decodedPayload = null;
      try {
        decodedPayload = jwtDecode(token);

        // Cek kadaluarsa token dan role (Client-side check)
        if (decodedPayload.exp * 1000 < Date.now() || decodedPayload.role !== 'ADMIN') {
          console.warn('Token expired or unauthorized role in sidebar. Redirecting.');
          localStorage.removeItem('authToken'); // Hapus token yang tidak valid/expired
          router.push('/login'); // Redirect jika tidak valid atau bukan admin
          return;
        }

        // Set data admin dari token yang sudah didecode
        setLoggedInAdmin({
          name: decodedPayload.name || decodedPayload.email.split('@')[0], // Gunakan nama dari token, atau dari email jika tidak ada
          email: decodedPayload.email,
          // Buat inisial dari nama atau email
          initials: (decodedPayload.name ? decodedPayload.name.split(' ').map(n => n[0]).join('') : decodedPayload.email[0]).toUpperCase(),
          avatar: decodedPayload.avatar || null // Asumsi ada avatar di payload token
        });

      } catch (error) {
        console.error('Error decoding token or verifying admin for sidebar:', error);
        localStorage.removeItem('authToken'); // Hapus token yang berpotensi rusak
        router.push('/login'); // Redirect pada error
      } finally {
        setLoadingSidebar(false); // Selesai loading
      }
    };

    fetchAdminData();
  }, [router]); // router sebagai dependency

  // --- Fungsi Logout (sama seperti sebelumnya) ---
  const handleLogout = () => {
    const isConfirmed = window.confirm('Are you sure you want to log out?');
    if (isConfirmed) {
      localStorage.removeItem('authToken');
      router.push('/');
    }
  };

  // --- Efek untuk mengelola item menu aktif (sama seperti sebelumnya) ---
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

  const handleItemClick = () => {
    // Anda bisa menambahkan logika di sini jika diperlukan,
    // misalnya untuk menutup sidebar di mobile.
  };

  // --- Tampilan Loading Sidebar ---
  if (loadingSidebar) {
    return (
      <div className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      } flex flex-col items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // --- Tampilan Sidebar Utama ---
  // Jika loggedInAdmin null setelah loading (artinya tidak terautentikasi/otorisasi),
  // komponen ini mungkin tidak perlu render apa-apa (karena sudah di-redirect).
  if (!loggedInAdmin) {
    return null;
  }

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

      {/* Admin Profile Section - Menggunakan loggedInAdmin */}
      <div className="border-t border-gray-100 p-4">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {loggedInAdmin.avatar ? (
                <img
                  src={loggedInAdmin.avatar}
                  alt={loggedInAdmin.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-medium text-sm">
                  {loggedInAdmin.initials}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {loggedInAdmin.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {loggedInAdmin.email}
              </p>
            </div>
            {/* Tombol Settings (opsional) */}
            <button className="p-1 rounded-md hover:bg-gray-100 transition-colors">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              {loggedInAdmin.avatar ? (
                <img
                  src={loggedInAdmin.avatar}
                  alt={loggedInAdmin.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-medium text-xs">
                  {loggedInAdmin.initials}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout Section - Menggunakan loggedInAdmin */}
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

// Pastikan komponen ini dibungkus di file AdminDashboard yang sudah dilindungi
const DashboardWithSidebar = ({ children }) => {
  // Ini adalah wrapper, biasanya di sini juga dilakukan proteksi jika Sidebar adalah bagian dari layout
  // Jika AdminDashboard.js sudah punya proteksi, ini mungkin tidak perlu proteksi lagi di sini.
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {children} {/* Konten halaman utama akan dirender di sini */}
      </div>
    </div>
  );
};

export default DashboardWithSidebar;