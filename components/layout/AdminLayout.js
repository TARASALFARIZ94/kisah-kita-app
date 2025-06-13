import { useRouter } from 'next/router';
import Sidebar from './Sidebar';

export default function AdminLayout({ children }) {
  const router = useRouter();
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar currentPath={router.pathname} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}