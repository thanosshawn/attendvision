
"use client";

import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data-context';
import type { AttendanceRecord } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { ArrowUpDown, Filter, ExternalLink } from 'lucide-react';

type SortKey = keyof AttendanceRecord | '';
const ALL_EMPLOYEES_VALUE = "__ALL__";

export function AttendanceLogTable() {
  const { attendanceRecords, employees, isLoading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState(''); // Initial value is empty string, placeholder will show
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedRecords = useMemo(() => {
    let records = [...attendanceRecords];

    if (searchTerm) {
      records = records.filter(record =>
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDate) {
      records = records.filter(record => record.date === filterDate);
    }

    if (filterEmployee && filterEmployee !== ALL_EMPLOYEES_VALUE) {
      records = records.filter(record => record.employeeId === filterEmployee);
    }

    if (sortKey) {
      records.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (sortKey === 'checkInTime' || sortKey === 'checkOutTime' || sortKey === 'date') {
          valA = valA ? parseISO(valA as string).getTime() : 0;
          valB = valB ? parseISO(valB as string).getTime() : 0;
          if (sortKey === 'date' && valA === 0 && a.checkInTime) valA = parseISO(a.checkInTime).getTime();
          if (sortKey === 'date' && valB === 0 && b.checkInTime) valB = parseISO(b.checkInTime).getTime();
        }
        
        if (typeof valA === 'string' && typeof valB === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return records;
  }, [attendanceRecords, searchTerm, filterDate, filterEmployee, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) { return 'Invalid Date'; }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
     try {
      return format(parseISO(timeString), 'p');
    } catch (e) { return 'Invalid Time'; }
  };


  if (isLoading) {
    return <Card className="shadow-lg"><CardHeader><CardTitle>Attendance Logs</CardTitle></CardHeader><CardContent><p>Loading logs...</p></CardContent></Card>;
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline">Attendance Logs</CardTitle>
        <CardDescription>View and filter attendance records.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg bg-card">
            <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow md:max-w-xs"
                aria-label="Search logs"
            />
            <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="flex-grow md:max-w-xs"
                aria-label="Filter by date"
            />
            <Select value={filterEmployee} onValueChange={setFilterEmployee} disabled={employees.length === 0}>
                <SelectTrigger className="flex-grow md:max-w-xs" aria-label="Filter by employee">
                    <SelectValue placeholder="Filter by Employee" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL_EMPLOYEES_VALUE}>All Employees</SelectItem>
                    {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
             <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterDate(''); setFilterEmployee(''); }} className="flex items-center gap-2">
                <Filter size={16}/> Clear Filters
            </Button>
        </div>

        {filteredAndSortedRecords.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No attendance records found matching your criteria.</p>
        ) : (
        <ScrollArea className="h-[500px] w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead onClick={() => handleSort('employeeName')} className="cursor-pointer hover:bg-accent/50">
                  Employee <ArrowUpDown size={14} className="inline ml-1" />
                </TableHead>
                <TableHead onClick={() => handleSort('date')} className="cursor-pointer hover:bg-accent/50">
                  Date <ArrowUpDown size={14} className="inline ml-1" />
                </TableHead>
                <TableHead onClick={() => handleSort('checkInTime')} className="cursor-pointer hover:bg-accent/50">
                  Check-In <ArrowUpDown size={14} className="inline ml-1" />
                </TableHead>
                <TableHead onClick={() => handleSort('checkOutTime')} className="cursor-pointer hover:bg-accent/50">
                  Check-Out <ArrowUpDown size={14} className="inline ml-1" />
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                 <TableHead>Edited</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedRecords.map((record) => (
                <TableRow key={record.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{record.employeeName} <span className="text-xs text-muted-foreground">({record.employeeId})</span></TableCell>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>{formatTime(record.checkInTime)}</TableCell>
                  <TableCell>{formatTime(record.checkOutTime)}</TableCell>
                  <TableCell>
                     <span className={`px-2 py-1 text-xs rounded-full ${
                        record.status === 'Checked-In' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100' :
                        record.status === 'Checked-Out' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
                        'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'
                      }`}>
                        {record.status}
                      </span>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={record.notes}>{record.notes || 'N/A'}</TableCell>
                  <TableCell>{record.manuallyEdited ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

