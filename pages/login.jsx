// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'; // Import Link yang hilang
import { jwtDecode } from 'jwt-decode'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Tambahkan state error
  const [success, setSuccess] = useState(''); // Tambahkan state success
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error
    setSuccess(''); // Reset success
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('authToken', data.token);

        try {
          // Use jwtDecode as a function directly
          const decodedToken = jwtDecode(data.token);
          const userRole = decodedToken.role;

          if (userRole === 'ADMIN') {
            setSuccess('Login berhasil! Mengalihkan ke dashboard admin...');
            router.push('/admin/dashboard');
          } else if (userRole === 'USER') {
            setSuccess('Login berhasil! Mengalihkan ke dashboard user...');
            router.push('/user/dashboard');
          } else {
            setError('Role pengguna tidak dikenal atau tidak memiliki akses ke dashboard.');
            localStorage.removeItem('authToken');
            router.push('/login');
          }
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          setError('Terjadi kesalahan saat memproses login. Silakan coba lagi.');
          localStorage.removeItem('authToken');
        }

      } else {
        setError(data.message || 'Login gagal.');
      }
    } catch (error) {
      console.error('Terjadi kesalahan jaringan atau server:', error);
      setError('Terjadi kesalahan saat login. Periksa koneksi Anda.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

// PENTING: Tambahkan default export
export default LoginPage;