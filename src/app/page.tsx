
"use client";

import { CameraView } from '@/components/attendance/camera-view';
import { ScanFace } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <ScanFace className="h-20 w-20 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-primary font-headline">AttendVision</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Face Recognition Attendance System
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Please look at the camera to check in or out.
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <CameraView />
      </div>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AttendVision. All rights reserved.</p>
        <Link href="/login" className="hover:text-primary underline">
            Admin Login
        </Link>
      </footer>
    </div>
  );
}
