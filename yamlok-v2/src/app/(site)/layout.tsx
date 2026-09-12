import SiteHeader from '@/components/sections/SiteHeader';
import SiteFooter from '@/components/sections/SiteFooter';
import VisitorTracker from '@/components/ui/VisitorTracker';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VisitorTracker />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
