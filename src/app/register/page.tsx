
"use client";

import React from 'react';
import { AddEmployeeForm } from '@/components/employees/add-employee-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RegisterEmployeePage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 flex flex-col items-center min-h-screen bg-background">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Attendance
            </Link>
          </Button>
        </div>
        <AddEmployeeForm />
      </div>
    </div>
  );
}
