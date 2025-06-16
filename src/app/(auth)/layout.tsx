import { ScanFace } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex flex-col items-center">
        <ScanFace className="h-16 w-16 text-primary" />
        <h1 className="mt-4 text-4xl font-bold text-primary font-headline">AttendVision</h1>
        <p className="text-muted-foreground">AI Powered Face Recognition Attendance</p>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
