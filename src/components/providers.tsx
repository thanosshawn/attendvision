"use client";

import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { DataProvider } from '@/contexts/data-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DataProvider>
        {children}
      </DataProvider>
    </ThemeProvider>
  );
}
