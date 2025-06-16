// components/layout/UserSidebar.js

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

import { 
  Home, 
  Plane, // For My Trips
  ClipboardList, // For Rundowns
  DollarSign, // For Split Bills
  Camera, // For Photo Gallery
  Settings, // For Account Settings
  HelpCircle, // For Help & Support
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  User // For user avatar in profile
} from 'lucide-react';

// Fungsi untuk mendapatkan token dari localStorage
// Ini harus dipanggil hanya di sisi klien
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

const UserSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  
  // State untuk menyimpan data user yang login
  const [loggedInUserData, setLoggedInUserData] = useState({
    name: 'Guest User', // Default name
    email: 'guest@example.com', // Default email
    avatar: null,
    initials: 'GU' // Default initials
  });
  
  // State activeItem akan disinkronkan dengan router.pathname di useEffect
  const [activeItem, setActiveItem] = useState('dashboard'); 

  // Efek untuk mengambil dan mendekode data user dari token
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Asumsikan token memiliki properti name dan email atau sejenisnya
        // Sesuaikan dengan struktur payload JWT Anda yang sebenarnya
        const name = decodedToken.name || decodedToken.email.split('@')[0]; // Ambil nama atau bagian email sebelum '@'
        const email = decodedToken.email;
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2); // Ambil 2 inisial pertama

        setLoggedInUserData({
          name: name,
          email: email,
          avatar: null, // Jika Anda memiliki URL avatar di token, gunakan di sini
          initials: initials
        });
      } catch (error) {
        console.error("Error decoding auth token:", error);
        // Handle case where token is invalid or expired
        setLoggedInUserData({
          name: 'Invalid User',
          email: 'error@example.com',
          avatar: null,
          initials: 'ER'
        });
        // Opsional: Redirect ke halaman login jika token tidak valid
        // router.push('/login');
      }
    } else {
      // Jika tidak ada token, set kembali ke data default Guest User
      setLoggedInUserData({
        name: 'Guest User',
        email: 'guest@example.com',
        avatar: null,
        initials: 'GU'
      });
    }
  }, []); // Hanya jalankan sekali saat komponen di-mount atau saat token berubah jika ada dependency di sini

  // Item menu khusus untuk pengguna
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/user/dashboard' },
    { id: 'trips', label: 'My Trips', icon: Plane, href: '/user/trips' },
    { id: 'rundowns', label: 'Rundowns', icon: ClipboardList, href: '/user/rundowns' },
    { id: 'splitbills', label: 'Split Bills', icon: DollarSign, href: '/user/splitbills' },
    { id: 'photos', label: 'Photo Gallery', icon: Camera, href: '/user/photos' },
  ];

  // Efek untuk mengatur item aktif berdasarkan pathname router saat ini
  useEffect(() => {
    const currentPath = router.pathname;
    const foundItem = menuItems.find(item => currentPath.startsWith(item.href)); // Menggunakan startsWith
    
    if (foundItem) {
      setActiveItem(foundItem.id);
    } else {
      // Fallback jika tidak ada match spesifik, tapi berada di bawah /user/
      if (currentPath.startsWith('/user/')) {
        setActiveItem('dashboard'); // Default ke dashboard jika di dalam area user tapi tidak match spesifik
      } else {
        setActiveItem(''); // Tidak ada yang aktif jika di luar area user
      }
    }
  }, [router.pathname]);

  // handleItemClick tidak perlu melakukan apapun jika menggunakan Link dan useEffect
  const handleItemClick = () => {};

  // --- Fungsi Logout (sama seperti sebelumnya) ---
  const handleLogout = () => {
    const isConfirmed = window.confirm('Are you sure you want to log out?');
    if (isConfirmed) {
      localStorage.removeItem('authToken');
      router.push('/');
    }
  };

  return (
    <div className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col`}>
      
      {/* Header dengan Logo Aplikasi */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        {/* Logo dan Nama Aplikasi saat Sidebar tidak dicollapse */}
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base">FT</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900 text-base">Friends Trip</span>
              <p className="text-xs text-gray-500">User Panel</p>
            </div>
          </div>
        )}
        {/* Logo saat Sidebar dicollapse */}
        {isCollapsed && (
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">FT</span>
          </div>
        )}
        {/* Tombol Toggle Sidebar */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4 px-3">
              Main Menu
            </p>
          )}
          {/* Render Item Menu */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Gunakan startsWith untuk deteksi aktif yang lebih baik pada rute nested
            const isActive = router.pathname.startsWith(item.href); 
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={handleItemClick}
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

      {/* User Profile Section */}
      <div className="border-t border-gray-100 p-4">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {loggedInUserData.avatar ? (
                <img 
                  src={loggedInUserData.avatar} 
                  alt={loggedInUserData.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-medium text-sm">
                  {loggedInUserData.initials}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {loggedInUserData.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {loggedInUserData.email}
              </p>
            </div>
            <Link href="/user/settings" className="p-1 rounded-md hover:bg-gray-100 transition-colors" aria-label="Account Settings">
              <Settings className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              {loggedInUserData.avatar ? (
                <img 
                  src={loggedInUserData.avatar} 
                  alt={loggedInUserData.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-medium text-xs">
                  {loggedInUserData.initials}
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
        {!isCollapsed && (
            <Link
                href="/user/help"
                className="w-full flex items-center px-3 py-2.5 mt-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
                onClick={handleItemClick}
            >
                <div className="flex items-center space-x-3">
                    <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    <span className="font-medium text-sm">Help & Support</span>
                </div>
            </Link>
        )}
      </div>
    </div>
  );
};

export default UserSidebar;