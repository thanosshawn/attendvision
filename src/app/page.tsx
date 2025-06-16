
"use client";

import { CameraView } from '@/components/attendance/camera-view';
import { ThemeToggle } from '@/components/theme-toggle';
import { ScanFace, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 relative">
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <Button variant="outline" asChild>
          <Link href="/register">
            <UserPlus className="mr-2 h-4 w-4" />
            Register Employee
          </Link>
        </Button>
        <ThemeToggle />
      </div>
      <div className="mb-6 mt-16 sm:mt-20 flex flex-col items-center text-center">
        <ScanFace className="h-16 w-16 sm:h-20 sm:w-20 text-primary mb-3 sm:mb-4" />
        <h1 className="text-3xl sm:text-4xl font-bold text-primary font-headline">AttendVision</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-md sm:text-lg">
          Face Recognition Attendance
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Please look at the camera to check in or out.
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <CameraView />
      </div>
      <footer className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AttendVision. All rights reserved.</p>
      </footer>
    </div>
  );
}
