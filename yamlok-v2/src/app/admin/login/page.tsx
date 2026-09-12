import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import LoginForm from '@/components/admin/LoginForm';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/admin');
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'radial-gradient(circle at 30% 50%, rgba(123,44,191,0.12) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(0,234,255,0.08) 0%, transparent 60%), #05070a' }}>
      <LoginForm />
    </div>
  );
}
