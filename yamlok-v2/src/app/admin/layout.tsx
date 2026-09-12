import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'YAMLOK — Admin',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
