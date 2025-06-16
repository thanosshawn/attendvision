
"use client";

import React from 'react';
import { ManualEntryForm } from '@/components/attendance/manual-entry-form';
import { Edit3 } from 'lucide-react';

export default function AdminAttendancePage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-headline text-primary flex items-center gap-2">
          <Edit3 className="h-7 w-7" /> Manual Attendance Entry
        </h1>
        <p className="text-muted-foreground">
          Administrators can use this page to manually record check-ins or check-outs for employees if needed.
        </p>
      </div>
      <ManualEntryForm />
    </div>
  );
}
