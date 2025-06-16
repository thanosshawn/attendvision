
"use client";

import React from 'react';
import { CameraView } from '@/components/attendance/camera-view';
import { ManualEntryForm } from '@/components/attendance/manual-entry-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Edit3 } from 'lucide-react';

export default function AttendancePage() {

  // This callback can be used to update a shared list or trigger other UI updates if needed
  // const handleAttendanceMarked = (record: any) => {
  //   console.log("Attendance marked:", record);
  // };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-headline text-primary">Attendance System</h1>
        <p className="text-muted-foreground">Employee attendance relies on face recognition. Manual entry is an option for administrators.</p>
      </div>

      <Tabs defaultValue="real-time" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex mb-6">
          <TabsTrigger value="real-time" className="flex items-center gap-2">
            <Camera className="h-4 w-4" /> Real-Time Recognition
          </TabsTrigger>
          <TabsTrigger value="manual-entry" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" /> Manual Entry
          </TabsTrigger>
        </TabsList>
        <TabsContent value="real-time">
          <CameraView /* onAttendanceMarked={handleAttendanceMarked} */ />
        </TabsContent>
        <TabsContent value="manual-entry">
          <ManualEntryForm /* onAttendanceMarked={handleAttendanceMarked} */ />
        </TabsContent>
      </Tabs>
    </div>
  );
}
