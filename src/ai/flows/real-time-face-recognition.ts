'use server';
/**
 * @fileOverview Recognizes faces in real-time from a camera feed and checks employees in/out.
 *
 * - realTimeFaceRecognition - A function that initiates real-time face recognition.
 * - RealTimeFaceRecognitionInput - The input type for the realTimeFaceRecognition function.
 * - RealTimeFaceRecognitionOutput - The return type for the realTimeFaceRecognition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RealTimeFaceRecognitionInputSchema = z.object({
  cameraFeedDataUri: z
    .string()
    .describe(
      "A data URI of the camera feed, must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  employeeDatabase: z.array(z.object({
    employeeId: z.string(),
    faceEncoding: z.string(), // Assuming face encoding is stored as a string
  })).describe('An array of employee face encodings and IDs.'),
});
export type RealTimeFaceRecognitionInput = z.infer<typeof RealTimeFaceRecognitionInputSchema>;

const RealTimeFaceRecognitionOutputSchema = z.object({
  employeeId: z.string().optional().describe('The ID of the recognized employee, if any.'),
  matchConfidence: z.number().optional().describe('The confidence level of the face match (0-1).'),
});
export type RealTimeFaceRecognitionOutput = z.infer<typeof RealTimeFaceRecognitionOutputSchema>;

export async function realTimeFaceRecognition(input: RealTimeFaceRecognitionInput): Promise<RealTimeFaceRecognitionOutput> {
  return realTimeFaceRecognitionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'realTimeFaceRecognitionPrompt',
  input: {schema: RealTimeFaceRecognitionInputSchema},
  output: {schema: RealTimeFaceRecognitionOutputSchema},
  prompt: `You are an AI-powered facial recognition system designed to identify employees from a live camera feed.

  Analyze the provided camera feed and compare the faces detected with the known employee database.
  Return the employeeId and a matchConfidence score (0-1) if a match is found. If no match is found, return an empty employeeId.

  Here is the camera feed data:
  {{media url=cameraFeedDataUri}}

  Here is the employee database:
  {{#each employeeDatabase}}
  Employee ID: {{{employeeId}}}, Face Encoding: {{{faceEncoding}}}
  {{/each}}
  `,
});

const realTimeFaceRecognitionFlow = ai.defineFlow(
  {
    name: 'realTimeFaceRecognitionFlow',
    inputSchema: RealTimeFaceRecognitionInputSchema,
    outputSchema: RealTimeFaceRecognitionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
