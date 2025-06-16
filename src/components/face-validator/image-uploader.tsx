"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { detectFaces, DetectFacesInput, DetectFacesOutput } from '@/ai/flows/face-detector';
import { Upload, Loader2, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export function ImageUploader() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectFacesOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUri(e.target?.result as string);
        setDetectionResult(null); // Reset previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    if (!imageUri) {
      toast({ variant: "destructive", title: "No Image", description: "Please select an image to verify." });
      return;
    }
    setIsVerifying(true);
    setDetectionResult(null);
    try {
      const input: DetectFacesInput = { photoDataUri: imageUri };
      const result = await detectFaces(input);
      setDetectionResult(result);
      if (result.facesDetected) {
        toast({ title: "Face Detected!", description: result.faceDetails || "One or more faces found in the image."});
      } else {
        toast({ variant: "default", title: "No Face Detected", description: "No human faces were found in the image."});
      }
    } catch (error) {
      console.error("Face detection error:", error);
      toast({ variant: "destructive", title: "Verification Error", description: "Could not process the image." });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2"><ShieldCheck /> Face Validator Tool</CardTitle>
        <CardDescription>Upload an image to check if it contains a human face.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="face-image-upload">Upload Image</Label>
          <Input
            id="face-image-upload"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>

        {imageUri && (
          <div className="mt-4 flex flex-col items-center">
            <img src={imageUri} alt="Uploaded for validation" data-ai-hint="person face" className="w-48 h-48 object-cover rounded-md border shadow-sm" />
          </div>
        )}

        {isVerifying && (
          <div className="flex items-center justify-center text-muted-foreground mt-4">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Verifying image...
          </div>
        )}

        {detectionResult && (
          <div className={`mt-4 p-3 rounded-md text-sm border ${detectionResult.facesDetected ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300'}`}>
            <div className="flex items-center gap-2 font-semibold">
              {detectionResult.facesDetected ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              {detectionResult.facesDetected ? "Face(s) Detected" : "No Face Detected"}
            </div>
            {detectionResult.faceDetails && <p className="mt-1 text-xs">{detectionResult.faceDetails}</p>}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleVerify} disabled={!imageUri || isVerifying} className="w-full">
          {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Verify Image
        </Button>
      </CardFooter>
    </Card>
  );
}
