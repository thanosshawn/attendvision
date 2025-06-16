
"use client";

import React from 'react';
import { ImageUploader } from '@/components/face-validator/image-uploader';

export default function AdminFaceValidatorPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 flex flex-col items-center">
      <div className="text-center mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 font-headline text-primary">Image Face Detector</h1>
        <p className="text-muted-foreground">
          This tool uses AI to detect human faces in an uploaded image. It helps ensure that images used for registration 
          are valid and suitable for face recognition.
        </p>
      </div>
      <ImageUploader />
    </div>
  );
}
