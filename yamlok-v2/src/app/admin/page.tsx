import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import AdminDashboard from '@/components/admin/AdminDashboard';

// metadata lives in admin/layout.tsx — can't export it alongside redirect here
export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  return <AdminDashboard />;
}
