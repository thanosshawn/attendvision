
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Employee, AttendanceRecord, EmployeeRecognitionData } from '@/types';

interface DataContextType {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>, faceImageUri: string) => Promise<void>;
  getEmployeeById: (employeeFieldValue: string) => Employee | undefined; // Changed to reflect lookup by form's employeeId field
  getEmployeeByInternalId: (internalId: string) => Employee | undefined; // For internal lookups
  getEmployeesForRecognition: () => EmployeeRecognitionData[];
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id' | 'employeeName'>) => Promise<AttendanceRecord | undefined>; // Return added record
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      try {
        setEmployees(JSON.parse(storedEmployees));
      } catch (e) {
        console.error("Error parsing employees from localStorage", e);
        localStorage.removeItem('employees'); // Clear corrupted data
      }
    }
    const storedAttendance = localStorage.getItem('attendanceRecords');
    if (storedAttendance) {
      try {
        setAttendanceRecords(JSON.parse(storedAttendance));
      } catch (e) {
        console.error("Error parsing attendance from localStorage", e);
        localStorage.removeItem('attendanceRecords'); // Clear corrupted data
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('employees', JSON.stringify(employees));
    }
  }, [employees, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    }
  }, [attendanceRecords, isLoading]);

  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt'>, faceImageUri: string) => {
    // Check if employeeId (user-defined ID) already exists
    const existingEmployee = employees.find(emp => emp.employeeId === employeeData.employeeId);
    if (existingEmployee) {
      throw new Error(`Employee with ID ${employeeData.employeeId} already exists.`);
    }

    setIsLoading(true);
    const newEmployee: Employee = {
      ...employeeData,
      id: `INTERNAL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // Internal unique ID
      faceImageUri,
      createdAt: new Date().toISOString(),
    };
    setEmployees((prev) => [...prev, newEmployee]);
    setIsLoading(false);
  };

  // Finds employee by their user-defined employeeId field (e.g., "EMP001")
  const getEmployeeById = (employeeFieldValue: string) => {
    return employees.find(emp => emp.employeeId === employeeFieldValue);
  };

  // Finds employee by their internal unique id field (e.g., "INTERNAL-xxxxx")
  const getEmployeeByInternalId = (internalId: string) => {
    return employees.find(emp => emp.id === internalId);
  };
  
  const getEmployeesForRecognition = (): EmployeeRecognitionData[] => {
    return employees.map(emp => ({
        employeeId: emp.id, // Use internal ID for recognition matching
        faceEncoding: emp.faceImageUri 
    }));
  };

  const addAttendanceRecord = async (recordData: Omit<AttendanceRecord, 'id' | 'employeeName'>): Promise<AttendanceRecord | undefined> => {
    setIsLoading(true);
    const employee = getEmployeeByInternalId(recordData.employeeId); // Use internal ID to find employee
    if (!employee) {
        setIsLoading(false);
        console.error("Employee not found for attendance record using internal ID:", recordData.employeeId);
        throw new Error("Employee not found for attendance record");
    }
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      employeeName: employee.name, // Store name for convenience
    };
    setAttendanceRecords((prev) => [...prev, newRecord]);
    setIsLoading(false);
    return newRecord;
  };
  
  const updateAttendanceRecord = async (id: string, updates: Partial<AttendanceRecord>) => {
    setIsLoading(true);
    setAttendanceRecords(prevRecords => 
      prevRecords.map(record => 
        record.id === id ? { ...record, ...updates, manuallyEdited: true } : record
      )
    );
    setIsLoading(false);
  };


  return (
    <DataContext.Provider value={{ 
        employees, 
        attendanceRecords, 
        addEmployee, 
        getEmployeeById, 
        getEmployeeByInternalId,
        getEmployeesForRecognition, 
        addAttendanceRecord, 
        updateAttendanceRecord, 
        isLoading 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

