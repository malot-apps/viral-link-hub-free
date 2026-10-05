import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#0b0d13]">
      <AdminDashboard standalone={true} />
    </main>
  );
}
