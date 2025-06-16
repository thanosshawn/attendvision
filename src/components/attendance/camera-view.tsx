
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { realTimeFaceRecognition, RealTimeFaceRecognitionInput, RealTimeFaceRecognitionOutput } from '@/ai/flows/real-time-face-recognition';
import { Camera, Zap, UserCheck, UserX, Loader2, Power, PowerOff, VideoOff } from 'lucide-react';
import { format } from 'date-fns';
import type { EmployeeRecognitionData, AttendanceRecord } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CameraViewProps {
  onAttendanceMarked?: (record: AttendanceRecord) => void;
}

export function CameraView({ onAttendanceMarked }: CameraViewProps) {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RealTimeFaceRecognitionOutput | null>(null);
  const [lastRecognizedName, setLastRecognizedName] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { getEmployeesForRecognition, getEmployeeById, addAttendanceRecord, attendanceRecords, updateAttendanceRecord } = useData();
  const { toast } = useToast();

  const getCameraPermission = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support camera access. Please use a different browser or device.',
      });
      setHasCameraPermission(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true); // Set camera active after permission is granted and stream is set
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this feature.',
      });
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    // Request camera permission when component mounts or when trying to turn camera on
    if (hasCameraPermission === null && !isCameraActive) { // Only request if not already decided and camera is intended to be off initially
        // getCameraPermission(); // We will call this explicitly when user tries to turn on camera.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const startCamera = async () => {
    if (hasCameraPermission === null || hasCameraPermission === false) {
        await getCameraPermission(); // This will set hasCameraPermission and setIsCameraActive
    } else if (hasCameraPermission === true && videoRef.current && !videoRef.current.srcObject) {
        // This case handles if permission was granted but stream was stopped.
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraActive(true);
        }
    } else {
        setIsCameraActive(true); // If permission already true and stream might be active
    }
    setRecognitionResult(null);
    setLastRecognizedName(null);
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
    if (!videoRef.current || videoRef.current.readyState < videoRef.current.HAVE_ENOUGH_DATA || processing || !isCameraActive) return;
    
    setProcessing(true);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if(!context) {
        setProcessing(false);
        toast({ variant: "destructive", title: "Canvas Error", description: "Could not get canvas context for recognition." });
        return;
    }
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
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
            await updateAttendanceRecord(existingRecord.id, { checkOutTime: new Date().toISOString(), status: 'Checked-Out' });
            toast({ title: "Checked Out", description: `${employee?.name} checked out at ${format(new Date(), 'p')}. Confidence: ${result.matchConfidence?.toFixed(2)}` });
            if(onAttendanceMarked) onAttendanceMarked({...existingRecord, checkOutTime: new Date().toISOString(), status: 'Checked-Out'});
          } else if (existingRecord.checkInTime && existingRecord.checkOutTime) {
             toast({ title: "Already Recorded", description: `${employee?.name} has already checked in and out today.` });
          }
        } else {
          const newRecord: Omit<AttendanceRecord, 'id' | 'employeeName'> = {
            employeeId: result.employeeId,
            checkInTime: new Date().toISOString(),
            date: today,
            status: 'Checked-In',
          };
          const addedRecord = await addAttendanceRecord(newRecord); // Assume addAttendanceRecord returns the full record with ID
          toast({ title: "Checked In", description: `${employee?.name} checked in at ${format(new Date(), 'p')}. Confidence: ${result.matchConfidence?.toFixed(2)}` });
          if(onAttendanceMarked && addedRecord) onAttendanceMarked(addedRecord);
        }
        if (isRecognizing && recognitionIntervalRef.current) {
            setIsRecognizing(false); 
            setTimeout(() => { if(isCameraActive && videoRef.current?.srcObject) setIsRecognizing(true); }, 5000); 
        }

      } else {
        setLastRecognizedName(null);
      }
    } catch (error) {
      console.error("Recognition error:", error);
    } finally {
      setProcessing(false);
    }
  }, [getEmployeesForRecognition, getEmployeeById, addAttendanceRecord, attendanceRecords, updateAttendanceRecord, toast, processing, isRecognizing, isCameraActive, onAttendanceMarked]);

  useEffect(() => {
    if (isRecognizing && isCameraActive && hasCameraPermission) {
      recognitionIntervalRef.current = setInterval(handleRecognition, 3000);
    } else if (recognitionIntervalRef.current) {
      clearInterval(recognitionIntervalRef.current);
      recognitionIntervalRef.current = null;
    }
    return () => {
      if (recognitionIntervalRef.current) clearInterval(recognitionIntervalRef.current);
      // stopCamera(); // Stop camera on unmount is good, but might interfere with toggling. Let manual stop handle it.
    };
  }, [isRecognizing, isCameraActive, hasCameraPermission, handleRecognition]);


  const toggleRecognition = () => {
    if (!isCameraActive) {
      // If camera is off, starting recognition should also attempt to start the camera
      toggleCameraPower().then(() => {
        // Only set isRecognizing if camera started successfully
        if (videoRef.current?.srcObject) {
            setIsRecognizing(true);
        }
      });
    } else {
      setIsRecognizing(prev => !prev);
    }
  };
  
  const toggleCameraPower = async () => {
    if(isCameraActive) {
        stopCamera();
    } else {
        await startCamera(); // startCamera now handles permission and sets isCameraActive
    }
  }

  useEffect(() => {
    // Cleanup camera on component unmount
    return () => {
        stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2"><Camera /> Real-time Attendance</CardTitle>
        <CardDescription>Use the camera to mark attendance. Ensure good lighting.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {(!isCameraActive || hasCameraPermission === false) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                {hasCameraPermission === false ? <VideoOff className="w-16 h-16 text-destructive/70 mb-4" /> : <Camera className="w-16 h-16 text-white/70 mb-4" />}
                <p className="text-white/90 text-center px-4">
                    {hasCameraPermission === false ? "Camera permission denied or unavailable." : "Camera is off. Press 'Turn Camera On' to start."}
                </p>
            </div>
          )}
        </div>

        {hasCameraPermission === false && (
            <Alert variant="destructive" className="mt-4">
              <VideoOff className="h-4 w-4" />
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Camera access is denied or unavailable. Please enable camera permissions in your browser settings and refresh the page, or try a different browser/device.
              </AlertDescription>
            </Alert>
        )}
        {hasCameraPermission === null && (
             <Alert className="mt-4">
              <Camera className="h-4 w-4" />
              <AlertTitle>Camera Permission</AlertTitle>
              <AlertDescription>
                Click "Turn Camera On" to activate the camera for face recognition. You may be prompted to allow camera access.
              </AlertDescription>
            </Alert>
        )}

        <div className="text-center min-h-[40px]"> {/* Added min-h to prevent layout shift */}
          {processing && <p className="text-sm text-muted-foreground flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</p>}
          {recognitionResult?.employeeId && lastRecognizedName && (
            <p className="text-lg font-semibold text-green-600 flex items-center justify-center gap-2">
              <UserCheck /> Recognized: {lastRecognizedName} (Confidence: {recognitionResult.matchConfidence?.toFixed(2)})
            </p>
          )}
          {recognitionResult && !recognitionResult.employeeId && !processing && (
            <p className="text-lg font-semibold text-red-600 flex items-center justify-center gap-2">
              <UserX /> No match found.
            </p>
          )}
          {!processing && !recognitionResult && isRecognizing && isCameraActive && hasCameraPermission && <p className="text-sm text-muted-foreground">Looking for faces...</p>}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
         <Button onClick={toggleCameraPower} variant={isCameraActive ? "outline" : "default"} className="w-full sm:w-auto">
          {isCameraActive ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
          {isCameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
        </Button>
        <Button onClick={toggleRecognition} disabled={(!isCameraActive && !isRecognizing) || processing || hasCameraPermission === false} className="w-full sm:w-auto">
          {isRecognizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
          {isRecognizing ? 'Stop Recognition' : 'Start Recognition'}
        </Button>
      </CardFooter>
    </Card>
  );
}
