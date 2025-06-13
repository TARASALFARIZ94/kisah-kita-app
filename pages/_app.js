import '@/styles/global.css'
import AdminLayout from '@/components/layout/AdminLayout';

export default function App({ Component, pageProps, router }) {
  // Cek apakah halaman admin
  const isAdminPage = router.pathname.startsWith('/admin');
  
  if (isAdminPage) {
    return (
      <AdminLayout>
        <Component {...pageProps} />
      </AdminLayout>
    );
  }
  
  return <Component {...pageProps} />;
}