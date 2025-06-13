// app/page.jsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Kisah Kita!</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-prose">
        Your ultimate app to document friendships, plan trips, and manage shared expenses.
      </p>
      <div className="space-x-4">
        <Link href="/register" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors">
          Register
        </Link>
        <Link href="/login" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 transition-colors">
          Login
        </Link>
      </div>
    </div>
  );
}