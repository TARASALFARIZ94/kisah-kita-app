// pages/dashboard.jsx
import { useRouter } from 'next/router'; // PERUBAHAN: next/router
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedToken = JSON.parse(window.atob(base64));

      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        console.warn('Token has expired.');
        localStorage.removeItem('auth_token');
        router.push('/login');
        return;
      }

      setUserEmail(decodedToken.email);
      setUserRole(decodedToken.role);
    } catch (e) {
      console.error("Failed to decode or parse token:", e);
      localStorage.removeItem('auth_token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700">Loading dashboard...</p>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-lg w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to your Dashboard!</h1>
        {userEmail && <p className="text-lg text-gray-700 mb-2">Logged in as: <span className="font-semibold">{userEmail}</span></p>}
        {userRole && <p className="text-lg text-gray-700 mb-6">Your Role: <span className={`font-bold ${userRole === 'ADMIN' ? 'text-purple-600' : 'text-blue-600'}`}>{userRole}</span></p>}

        <p className="text-gray-600 mb-8">This is a protected page. Only authenticated users can see this content. The content you see here might differ based on your role.</p>

        {userRole === 'ADMIN' && (
          <div className="mt-8 p-6 bg-purple-50 border border-purple-200 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-purple-800 mb-3">Admin Panel Access</h2>
            <p className="text-purple-700 mb-4">As an **ADMIN**, you have access to special administrative features and elevated privileges.</p>
            <button className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200">
              Manage All Users
            </button>
            <button className="mt-2 w-full py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200">
              View System Logs
            </button>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="mt-8 w-full py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
}