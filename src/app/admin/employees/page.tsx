
"use client";

import React, { useState } from 'react';
import { AddEmployeeForm } from '@/components/employees/add-employee-form';
import { EmployeeList } from '@/components/employees/employee-list';
import { Separator } from '@/components/ui/separator';

export default function AdminEmployeesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEmployeeAdded = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline text-primary">Employee Management</h1>
        <p className="text-muted-foreground">Register new employees and manage existing ones.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <AddEmployeeForm onEmployeeAdded={handleEmployeeAdded} />
        <EmployeeList key={refreshKey} />
      </div>
    </div>
  );
}
