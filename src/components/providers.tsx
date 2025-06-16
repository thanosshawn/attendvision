"use client";

import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { DataProvider } from '@/contexts/data-context';
import { SidebarProvider } from '@/components/ui/sidebar'; // Import SidebarProvider

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <DataProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
