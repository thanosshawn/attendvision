
"use client";

import React from 'react';
import { AttendanceLogTable } from '@/components/logs/attendance-log-table';

export default function AdminLogsPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-headline text-primary">Attendance Logs</h1>
        <p className="text-muted-foreground">Review all recorded attendance entries.</p>
      </div>
      <AttendanceLogTable />
    </div>
  );
}
