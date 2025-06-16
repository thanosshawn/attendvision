"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { realTimeFaceRecognition, RealTimeFaceRecognitionInput, RealTimeFaceRecognitionOutput } from '@/ai/flows/real-time-face-recognition';
import { Camera, Zap, UserCheck, UserX, Loader2, Power, PowerOff } from 'lucide-react';
import { format } from 'date-fns';
import type { EmployeeRecognitionData, AttendanceRecord } from '@/types';

interface CameraViewProps {
  onAttendanceMarked?: (record: AttendanceRecord) => void;
}

export function CameraView({ onAttendanceMarked }: CameraViewProps) {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RealTimeFaceRecognitionOutput | null>(null);
  const [lastRecognizedName, setLastRecognizedName] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [processing, setProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { getEmployeesForRecognition, getEmployeeById, addAttendanceRecord, attendanceRecords, updateAttendanceRecord } = useData();
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setRecognitionResult(null);
        setLastRecognizedName(null);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({ variant: "destructive", title: "Camera Error", description: "Could not access camera. Please ensure permissions are granted." });
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (recognitionIntervalRef.current) {
      clearInterval(recognitionIntervalRef.current);
      recognitionIntervalRef.current = null;
    }
    setIsCameraActive(false);
    setIsRecognizing(false);
    setProcessing(false);
  };

  const handleRecognition = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState < videoRef.current.HAVE_ENOUGH_DATA || processing) return;
    
    setProcessing(true);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const frameDataUri = canvas.toDataURL('image/jpeg');

    const employeeDatabase: EmployeeRecognitionData[] = getEmployeesForRecognition();
    if (employeeDatabase.length === 0) {
      toast({ variant: "default", title: "No Employees", description: "No employees registered for recognition." });
      setProcessing(false);
      return;
    }

    try {
      const input: RealTimeFaceRecognitionInput = { cameraFeedDataUri: frameDataUri, employeeDatabase };
      const result = await realTimeFaceRecognition(input);
      setRecognitionResult(result);

      if (result.employeeId) {
        const employee = getEmployeeById(result.employeeId);
        setLastRecognizedName(employee?.name || 'Unknown Employee');
        
        const today = format(new Date(), 'yyyy-MM-dd');
        const existingRecord = attendanceRecords.find(
          r => r.employeeId === result.employeeId && r.date === today
        );

        if (existingRecord) {
          if (existingRecord.checkInTime && !existingRecord.checkOutTime) {
            // Already checked in, mark check-out
            await updateAttendanceRecord(existingRecord.id, { checkOutTime: new Date().toISOString(), status: 'Checked-Out' });
            toast({ title: "Checked Out", description: `${employee?.name} checked out at ${format(new Date(), 'p')}. Confidence: ${result.matchConfidence?.toFixed(2)}` });
            if(onAttendanceMarked) onAttendanceMarked({...existingRecord, checkOutTime: new Date().toISOString(), status: 'Checked-Out'});
          } else if (existingRecord.checkInTime && existingRecord.checkOutTime) {
            // Already checked in and out for the day
             toast({ title: "Already Recorded", description: `${employee?.name} has already checked in and out today.` });
          }
        } else {
          // New check-in
          const newRecord: Omit<AttendanceRecord, 'id' | 'employeeName'> = {
            employeeId: result.employeeId,
            checkInTime: new Date().toISOString(),
            date: today,
            status: 'Checked-In',
          };
          await addAttendanceRecord(newRecord);
          toast({ title: "Checked In", description: `${employee?.name} checked in at ${format(new Date(), 'p')}. Confidence: ${result.matchConfidence?.toFixed(2)}` });
          if(onAttendanceMarked) onAttendanceMarked({...newRecord, id: 'temp', employeeName: employee?.name || ''}); // temp id for immediate feedback
        }
        // Stop recognition briefly after a successful match to avoid rapid multiple entries
        if (isRecognizing && recognitionIntervalRef.current) {
            setIsRecognizing(false); // Pause recognition
            setTimeout(() => { if(isCameraActive) setIsRecognizing(true); }, 5000); // Resume after 5s
        }

      } else {
        setLastRecognizedName(null);
      }
    } catch (error) {
      console.error("Recognition error:", error);
      // toast({ variant: "destructive", title: "Recognition Error", description: "Could not process the frame." });
    } finally {
      setProcessing(false);
    }
  }, [getEmployeesForRecognition, getEmployeeById, addAttendanceRecord, attendanceRecords, updateAttendanceRecord, toast, processing, isRecognizing, isCameraActive, onAttendanceMarked]);

  useEffect(() => {
    if (isRecognizing && isCameraActive) {
      recognitionIntervalRef.current = setInterval(handleRecognition, 3000); // Recognize every 3 seconds
    } else if (recognitionIntervalRef.current) {
      clearInterval(recognitionIntervalRef.current);
      recognitionIntervalRef.current = null;
    }
    return () => {
      if (recognitionIntervalRef.current) clearInterval(recognitionIntervalRef.current);
      stopCamera(); // Ensure camera stops on component unmount
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecognizing, isCameraActive, handleRecognition]);


  const toggleRecognition = () => {
    if (!isCameraActive) {
      startCamera();
      setIsRecognizing(true);
    } else {
      if (isRecognizing) {
        setIsRecognizing(false); // This will stop the interval via useEffect
      } else {
        setIsRecognizing(true); // This will start the interval via useEffect
      }
    }
  };
  
  const toggleCameraPower = () => {
    if(isCameraActive) {
        stopCamera();
    } else {
        startCamera();
        // Optionally auto-start recognition if camera is powered on
        // setIsRecognizing(true); 
    }
  }


  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2"><Camera /> Real-time Attendance</CardTitle>
        <CardDescription>Use the camera to mark attendance. Ensure good lighting.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                <Camera className="w-16 h-16 text-white/70 mb-4" />
                <p className="text-white/90">Camera is off</p>
            </div>
          )}
        </div>
        <div className="text-center">
          {processing && <p className="text-sm text-muted-foreground flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</p>}
          {recognitionResult?.employeeId && lastRecognizedName && (
            <p className="text-lg font-semibold text-green-600 flex items-center justify-center gap-2">
              <UserCheck /> Recognized: {lastRecognizedName} (Confidence: {recognitionResult.matchConfidence?.toFixed(2)})
            </p>
          )}
          {recognitionResult && !recognitionResult.employeeId && (
            <p className="text-lg font-semibold text-red-600 flex items-center justify-center gap-2">
              <UserX /> No match found.
            </p>
          )}
          {!processing && !recognitionResult && isRecognizing && <p className="text-sm text-muted-foreground">Looking for faces...</p>}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
         <Button onClick={toggleCameraPower} variant={isCameraActive ? "outline" : "default"} className="w-full sm:w-auto">
          {isCameraActive ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
          {isCameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
        </Button>
        <Button onClick={toggleRecognition} disabled={!isCameraActive || processing} className="w-full sm:w-auto">
          {isRecognizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
          {isRecognizing ? 'Stop Recognition' : 'Start Recognition'}
        </Button>
      </CardFooter>
    </Card>
  );
}

