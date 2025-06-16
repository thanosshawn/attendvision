"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { detectFaces, DetectFacesInput, DetectFacesOutput } from '@/ai/flows/face-detector';
import { Camera, Upload, Loader2, CheckCircle, AlertTriangle, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';

const employeeSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  department: z.string().optional(),
  employeeId: z.string().min(3, { message: 'Employee ID must be at least 3 characters' }).regex(/^[a-zA-Z0-9-]+$/, { message: 'Employee ID can only contain letters, numbers, and hyphens' }),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface AddEmployeeFormProps {
  onEmployeeAdded?: () => void;
}

export function AddEmployeeForm({ onEmployeeAdded }: AddEmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faceImageUri, setFaceImageUri] = useState<string | null>(null);
  const [isVerifyingFace, setIsVerifyingFace] = useState(false);
  const [faceDetectionResult, setFaceDetectionResult] = useState<DetectFacesOutput | null>(null);
  const [showCameraDialog, setShowCameraDialog] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addEmployee, getEmployeeById } = useData();
  const { toast } = useToast();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const uri = e.target?.result as string;
        setFaceImageUri(uri);
        verifyFace(uri);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({ variant: "destructive", title: "Camera Error", description: "Could not access camera." });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureFace = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');
      setFaceImageUri(dataUri);
      verifyFace(dataUri);
      setShowCameraDialog(false); // Close dialog after capture
    }
  };
  
  const verifyFace = async (uri: string) => {
    setIsVerifyingFace(true);
    setFaceDetectionResult(null);
    try {
      const input: DetectFacesInput = { photoDataUri: uri };
      const result = await detectFaces(input);
      setFaceDetectionResult(result);
      if (!result.facesDetected) {
        toast({ variant: "destructive", title: "Face Not Detected", description: "Please upload or capture an image with a clear human face." });
      } else {
         toast({ title: "Face Detected", description: result.faceDetails || "Face successfully detected." });
      }
    } catch (error) {
      console.error("Face detection error:", error);
      toast({ variant: "destructive", title: "Verification Error", description: "Could not verify the image." });
    } finally {
      setIsVerifyingFace(false);
    }
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    if (!faceImageUri) {
      toast({ variant: "destructive", title: "Missing Face Image", description: "Please capture or upload a face image." });
      return;
    }
    if (!faceDetectionResult?.facesDetected) {
      toast({ variant: "destructive", title: "Face Not Verified", description: "Please ensure a valid face is detected in the image." });
      return;
    }
    if (getEmployeeById(data.employeeId)) {
        form.setError("employeeId", { type: "manual", message: "This Employee ID already exists." });
        toast({ variant: "destructive", title: "Duplicate ID", description: "An employee with this ID already exists." });
        return;
    }

    setIsSubmitting(true);
    try {
      await addEmployee({ name: data.name, department: data.department, employeeId: data.employeeId }, faceImageUri);
      toast({ title: "Employee Added", description: `${data.name} has been successfully registered.` });
      form.reset();
      setFaceImageUri(null);
      setFaceDetectionResult(null);
      if (onEmployeeAdded) onEmployeeAdded();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Add Employee",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2"><UserPlus /> Add New Employee</CardTitle>
        <CardDescription>Fill in the details and capture/upload a face image for registration.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...form.register('name')} aria-invalid={!!form.formState.errors.name} />
              {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input id="employeeId" {...form.register('employeeId')} aria-invalid={!!form.formState.errors.employeeId}/>
              {form.formState.errors.employeeId && <p className="text-sm text-destructive">{form.formState.errors.employeeId.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department (Optional)</Label>
            <Input id="department" {...form.register('department')} />
          </div>

          <div className="space-y-2">
            <Label>Face Image</Label>
            <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-md">
              {faceImageUri ? (
                <img src={faceImageUri} alt="Captured face" data-ai-hint="person face" className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-md" />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-muted rounded-md flex items-center justify-center">
                  <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-2">
                <Dialog open={showCameraDialog} onOpenChange={(isOpen) => {
                  setShowCameraDialog(isOpen);
                  if (isOpen) startCamera(); else stopCamera();
                }}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline"><Camera className="mr-2 h-4 w-4" />Capture</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Capture Face</DialogTitle>
                      <DialogDescription>Position your face clearly in the frame and click capture.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                       <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md bg-black"></video>
                       <canvas ref={canvasRef} className="hidden"></canvas>
                       <p className="text-xs text-muted-foreground">Ensure good lighting and a clear view of your face. Avoid wearing hats or sunglasses.</p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                      <Button type="button" onClick={captureFace}>Capture Image</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />Upload
                </Button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
              </div>
              {isVerifyingFace && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying image...
                </div>
              )}
              {faceDetectionResult && (
                <div className={`flex items-center text-sm ${faceDetectionResult.facesDetected ? 'text-green-600' : 'text-red-600'}`}>
                  {faceDetectionResult.facesDetected ? <CheckCircle className="mr-2 h-4 w-4" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                  {faceDetectionResult.faceDetails || (faceDetectionResult.facesDetected ? 'Face detected.' : 'No face detected.')}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Guidance: Ensure good lighting, face is centered, and no obstructions like glasses or hats for best results.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting || isVerifyingFace || !faceDetectionResult?.facesDetected}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Register Employee
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
