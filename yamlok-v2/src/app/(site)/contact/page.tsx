import ContactSection from '@/components/sections/ContactSection';

export const metadata = { title: 'YAMLOK — Contact' };

export default function ContactPage() {
  return (
    <div className="px-6 md:px-12 py-14" style={{ minHeight: 'calc(100vh - 130px)' }}>
      <ContactSection />
    </div>
  );
}
