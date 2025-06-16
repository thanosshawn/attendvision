// src/ai/flows/face-detector.ts
'use server';
/**
 * @fileOverview A GenAI-powered image face detector tool to validate that uploaded images contain human faces.
 *
 * - detectFaces - A function that handles the face detection process.
 * - DetectFacesInput - The input type for the detectFaces function.
 * - DetectFacesOutput - The return type for the detectFaces function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectFacesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectFacesInput = z.infer<typeof DetectFacesInputSchema>;

const DetectFacesOutputSchema = z.object({
  facesDetected: z.boolean().describe('Whether or not any faces were detected in the image.'),
  faceDetails: z.string().optional().describe('Details about the faces detected, if any.'),
});
export type DetectFacesOutput = z.infer<typeof DetectFacesOutputSchema>;

export async function detectFaces(input: DetectFacesInput): Promise<DetectFacesOutput> {
  return detectFacesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectFacesPrompt',
  input: {schema: DetectFacesInputSchema},
  output: {schema: DetectFacesOutputSchema},
  prompt: `You are an AI expert in image recognition. Your task is to analyze the given image and determine if it contains any human faces.

  Respond with whether any faces were detected, and if so, provide some details about the faces.

  Image: {{media url=photoDataUri}}
`,
});

const detectFacesFlow = ai.defineFlow(
  {
    name: 'detectFacesFlow',
    inputSchema: DetectFacesInputSchema,
    outputSchema: DetectFacesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
