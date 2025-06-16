
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';

export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Or a redirect component, though useEffect handles it
  }

  return (
    <div className="flex min-h-screen w-full">
        <SidebarNav />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <SidebarInset>
            <main className="flex-1 p-4 md:p-6 lg:p-8 page-transition">
              {children}
            </main>
            <Toaster />
          </SidebarInset>
        </div>
    </div>
  );
}
