export interface Employee {
  id: string; // Unique employee ID e.g., EMP001
  name: string;
  faceImageUri: string; // Data URI of the registered face photo
  department?: string;
  createdAt: string; // ISO date string
}

export interface AttendanceRecord {
  id: string; // Unique record ID
  employeeId: string;
  employeeName: string;
  checkInTime?: string; // ISO date string
  checkOutTime?: string; // ISO date string
  date: string; // YYYY-MM-DD format
  status: 'Checked-In' | 'Checked-Out' | 'Absent';
  manuallyEdited?: boolean;
  notes?: string;
}

// For realTimeFaceRecognition GenAI flow
export interface EmployeeRecognitionData {
  employeeId: string;
  faceEncoding: string; // This will be the faceImageUri for the GenAI flow
}
