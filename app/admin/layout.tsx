import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Operations & Monetization Dashboard - VIRAL LINK HUB',
  description: 'Protected administration console for Viral Link Hub streaming, monetization, and video management.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#e2e8f0]">
      {children}
    </div>
  );
}
