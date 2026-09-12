import AboutSection from '@/components/sections/AboutSection';

export const metadata = { title: 'YAMLOK — About' };

export default function AboutPage() {
  return (
    <div className="px-6 md:px-12 py-14" style={{ minHeight: 'calc(100vh - 130px)' }}>
      <AboutSection />
    </div>
  );
}
