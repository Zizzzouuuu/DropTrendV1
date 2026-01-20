import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import Chatbot from '@/components/dashboard/Chatbot';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground relative transition-colors">
      <Sidebar />
      <main className="lg:ml-64 p-4 md:p-8">
        {children}
      </main>
      <Chatbot />
    </div>
  );
}
