"use client";

import React, { useState }_ from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { Loader2, Edit3 } from 'lucide-react';
import type { AttendanceRecord } from '@/types';

const manualEntrySchema = z.object({
  employeeId: z.string().min(1, { message: 'Please select an employee' }),
  entryType: z.enum(['check-in', 'check-out']),
  dateTime: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date and time" }),
  notes: z.string().optional(),
});

type ManualEntryFormValues = z.infer<typeof manualEntrySchema>;

interface ManualEntryFormProps {
  onAttendanceMarked?: (record: AttendanceRecord) => void;
}

export function ManualEntryForm({ onAttendanceMarked }: ManualEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { employees, attendanceRecords, addAttendanceRecord, updateAttendanceRecord, getEmployeeById } = useData();
  const { toast } = useToast();

  const form = useForm<ManualEntryFormValues>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    }
  });

  const onSubmit = async (data: ManualEntryFormValues) => {
    setIsSubmitting(true);
    try {
      const selectedEmployee = getEmployeeById(data.employeeId);
      if (!selectedEmployee) {
        toast({ variant: "destructive", title: "Error", description: "Selected employee not found." });
        setIsSubmitting(false);
        return;
      }

      const entryDate = format(parseISO(data.dateTime), 'yyyy-MM-dd');
      const entryTimestamp = parseISO(data.dateTime).toISOString();

      const existingRecord = attendanceRecords.find(
        r => r.employeeId === data.employeeId && r.date === entryDate
      );
      
      let updatedRecord: AttendanceRecord;

      if (data.entryType === 'check-in') {
        if (existingRecord?.checkInTime) {
           toast({ variant: "destructive", title: "Already Checked In", description: `${selectedEmployee.name} already has a check-in record for this date.` });
           setIsSubmitting(false);
           return;
        }
        const newRecordData: Omit<AttendanceRecord, 'id' | 'employeeName'> = {
          employeeId: data.employeeId,
          checkInTime: entryTimestamp,
          date: entryDate,
          status: 'Checked-In',
          manuallyEdited: true,
          notes: data.notes,
        };
        await addAttendanceRecord(newRecordData);
        updatedRecord = { ...newRecordData, id: 'temp-manual-in', employeeName: selectedEmployee.name }; // temp for callback
        toast({ title: "Manual Check-In", description: `${selectedEmployee.name} manually checked in.` });
      } else { // check-out
        if (!existingRecord?.checkInTime) {
          toast({ variant: "destructive", title: "No Check-In Found", description: `${selectedEmployee.name} has no check-in record for this date to check out from.` });
          setIsSubmitting(false);
          return;
        }
        if (existingRecord?.checkOutTime) {
          toast({ variant: "destructive", title: "Already Checked Out", description: `${selectedEmployee.name} is already checked out for this date.` });
          setIsSubmitting(false);
          return;
        }
        await updateAttendanceRecord(existingRecord.id, { 
          checkOutTime: entryTimestamp, 
          status: 'Checked-Out', 
          manuallyEdited: true,
          notes: existingRecord.notes ? `${existingRecord.notes}; ${data.notes}` : data.notes 
        });
        updatedRecord = { ...existingRecord, checkOutTime: entryTimestamp, status: 'Checked-Out', manuallyEdited: true, notes: data.notes };
        toast({ title: "Manual Check-Out", description: `${selectedEmployee.name} manually checked out.` });
      }
      
      if (onAttendanceMarked && updatedRecord) onAttendanceMarked(updatedRecord);
      form.reset({ dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm") });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Manual Entry Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2"><Edit3 /> Manual Attendance Entry</CardTitle>
        <CardDescription>Manually record check-in or check-out for an employee.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee</Label>
            <Controller
              name="employeeId"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={employees.length === 0}>
                  <SelectTrigger aria-invalid={!!form.formState.errors.employeeId}>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.length > 0 ? employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</SelectItem>
                    )) : <SelectItem value="no-emp" disabled>No employees available</SelectItem>}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.employeeId && <p className="text-sm text-destructive">{form.formState.errors.employeeId.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryType">Entry Type</Label>
              <Controller
                name="entryType"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger aria-invalid={!!form.formState.errors.entryType}>
                      <SelectValue placeholder="Select entry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="check-in">Check-In</SelectItem>
                      <SelectItem value="check-out">Check-Out</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.entryType && <p className="text-sm text-destructive">{form.formState.errors.entryType.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTime">Date and Time</Label>
              <Input id="dateTime" type="datetime-local" {...form.register('dateTime')} aria-invalid={!!form.formState.errors.dateTime} />
              {form.formState.errors.dateTime && <p className="text-sm text-destructive">{form.formState.errors.dateTime.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" placeholder="Reason for manual entry, e.g., system issue, forgot card." {...form.register('notes')} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting || employees.length === 0}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Entry
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
