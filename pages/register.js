// pages/register.jsx
import { useState } from 'react';
import { useRouter } from 'next/router'; 
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Client-side error during registration:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4 relative overflow-hidden"> {/* Matched LoginPage background */}
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20"> {/* Matched LoginPage opacity */}
        <div className="absolute top-20 right-20 w-80 h-80 bg-gray-600 rounded-full blur-3xl"></div> {/* Matched LoginPage color scheme */}
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gray-400 rounded-full blur-3xl"></div> {/* Matched LoginPage color scheme */}
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gray-500 rounded-full blur-3xl"></div> {/* Matched LoginPage color scheme */}
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{ /* Matched LoginPage opacity */
        backgroundImage: `radial-gradient(circle at 1px 1px, #4b5563 1px, transparent 0)`, /* Matched LoginPage grid color */
        backgroundSize: '20px 20px'
      }}></div>

      <div className="relative z-10 bg-white/90 backdrop-blur-xl border border-gray-300/50 p-8 rounded-2xl shadow-2xl w-full max-w-md"> {/* Matched LoginPage card style */}
        {/* Back to Landing Button */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center px-3 py-2 bg-gray-100/80 backdrop-blur-sm border border-gray-300/50 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-200/80 transition-all duration-300 group text-sm" 
          >
            <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> {/* Icon color to white */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1> {/* Matched LoginPage text color */}
          <p className="text-gray-600 text-sm">Join us and start your journey today</p> {/* Matched LoginPage text color */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="group">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2"> {/* Matched LoginPage label text color */}
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-all duration-300 backdrop-blur-sm" 
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div> {/* Matched LoginPage input hover effect */}
              </div>
            </div>

            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2" > {/* Matched LoginPage label text color */}
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-all duration-300 backdrop-blur-sm" 
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div> {/* Matched LoginPage input hover effect */}
              </div>
            </div>

            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2"> {/* Matched LoginPage label text color */}
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-all duration-300 backdrop-blur-sm" 
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div> {/* Matched LoginPage input hover effect */}
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 backdrop-blur-sm"> {/* Matched LoginPage error background/border */}
              <p className="text-red-700 text-sm text-center flex items-center justify-center"> {/* Matched LoginPage error text color */}
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 backdrop-blur-sm"> {/* Matched LoginPage success background/border */}
              <p className="text-green-700 text-sm text-center flex items-center justify-center"> {/* Matched LoginPage success text color */}
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {success}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative group bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden" 
          >
            <div className="absolute inset-0 bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div> {/* Matched LoginPage submit button hover effect */}
            <span className="relative flex items-center justify-center">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </span>
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm"> {/* Matched LoginPage text color */}
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-gray-800 font-medium hover:text-gray-600 transition-colors duration-300 underline decoration-gray-400/50 hover:decoration-gray-600/80 underline-offset-4" 
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Terms and Privacy */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-xs"> {/* Matched LoginPage text color */}
            By creating an account, you agree to our{' '}
            <a href="#" className="text-gray-800 hover:text-gray-600 transition-colors duration-300 underline decoration-gray-400/50 hover:decoration-gray-600/80 underline-offset-4"> {/* Matched LoginPage link style */}
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-gray-800 hover:text-gray-600 transition-colors duration-300 underline decoration-gray-400/50 hover:decoration-gray-600/80 underline-offset-4"> {/* Matched LoginPage link style */}
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Decorative border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-200/20 via-transparent to-gray-200/20 opacity-30 pointer-events-none"></div> {/* Matched LoginPage decorative border */}
      </div>
    </div>
  );
}
