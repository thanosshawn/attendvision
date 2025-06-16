"use client";

import React from 'react';
import { useData } from '@/contexts/data-context';
import type { Employee } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Briefcase, Hash, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function EmployeeList() {
  const { employees, isLoading } = useData();

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Registered Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading employees...</p>
        </CardContent>
      </Card>
    );
  }

  if (employees.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Registered Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No employees registered yet. Add an employee to see them listed here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline">Registered Employees ({employees.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {employees.map((employee: Employee) => (
              <div key={employee.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={employee.faceImageUri} alt={employee.name} data-ai-hint="person face" />
                  <AvatarFallback>{employee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-md">{employee.name}</p>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                     <p className="flex items-center gap-1"><Hash size={12}/> {employee.employeeId}</p>
                    {employee.department && <p className="flex items-center gap-1"><Briefcase size={12}/> {employee.department}</p>}
                     <p className="flex items-center gap-1"><Calendar size={12}/> Joined: {format(new Date(employee.createdAt), "MMM d, yyyy")}</p>
                  </div>
                </div>
                {/* Add actions like Edit/Delete if needed */}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
