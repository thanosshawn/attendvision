"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Employee, AttendanceRecord, EmployeeRecognitionData } from '@/types';

interface DataContextType {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>, faceImageUri: string) => Promise<void>;
  getEmployeeById: (id: string) => Employee | undefined;
  getEmployeesForRecognition: () => EmployeeRecognitionData[];
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id' | 'employeeName'>) => Promise<void>;
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage on mount
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    }
    const storedAttendance = localStorage.getItem('attendanceRecords');
    if (storedAttendance) {
      setAttendanceRecords(JSON.parse(storedAttendance));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Save data to localStorage when it changes
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
    setIsLoading(true);
    const newEmployee: Employee = {
      ...employeeData,
      id: `EMP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      faceImageUri,
      createdAt: new Date().toISOString(),
    };
    setEmployees((prev) => [...prev, newEmployee]);
    setIsLoading(false);
  };

  const getEmployeeById = (id: string) => {
    return employees.find(emp => emp.id === id);
  };
  
  const getEmployeesForRecognition = (): EmployeeRecognitionData[] => {
    return employees.map(emp => ({
        employeeId: emp.id,
        faceEncoding: emp.faceImageUri // Using faceImageUri as faceEncoding
    }));
  };

  const addAttendanceRecord = async (recordData: Omit<AttendanceRecord, 'id' | 'employeeName'>) => {
    setIsLoading(true);
    const employee = getEmployeeById(recordData.employeeId);
    if (!employee) {
        setIsLoading(false);
        throw new Error("Employee not found for attendance record");
    }
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      employeeName: employee.name,
    };
    setAttendanceRecords((prev) => [...prev, newRecord]);
    setIsLoading(false);
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
    <DataContext.Provider value={{ employees, attendanceRecords, addEmployee, getEmployeeById, getEmployeesForRecognition, addAttendanceRecord, updateAttendanceRecord, isLoading }}>
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
