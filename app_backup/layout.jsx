// app/layout.jsx
import './globals.css'; 
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Friends Trip',
  description: 'Your friends trip documentation app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Children adalah komponen halaman yang sedang diakses (misal: RegisterPage, LoginPage, DashboardPage) */}
        {children}
      </body>
    </html>
  );
}