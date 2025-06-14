// components/layout/UserLayout.js

import React from 'react';
import UserSidebar from './UserSidebar'; // Import UserSidebar

export default function UserLayout({ children }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Sidebar Pengguna */}
      <UserSidebar />
      
      {/* Konten Utama Halaman */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
