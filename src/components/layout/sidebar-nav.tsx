
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Edit3, // Changed from Camera to Edit3 for Manual Attendance
  ShieldCheck,
  ScanFace,
  LogOut,
  ChevronsLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/attendance', label: 'Manual Attendance', icon: Edit3 }, // Updated label and icon
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/logs', label: 'Attendance Logs', icon: ClipboardList },
  { href: '/admin/face-validator', label: 'Face Validator', icon: ShieldCheck },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login'); // Redirect to public login page
  };

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="flex items-center justify-between p-3 border-b">
        <Link href="/admin/dashboard" className={cn(
            "flex items-center gap-2 font-semibold",
            state === "collapsed" && "justify-center"
        )}>
          <ScanFace className="h-7 w-7 text-primary" />
          {state === "expanded" && <span className="text-xl font-headline">AttendVision</span>}
        </Link>
        {state === "expanded" && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex" aria-label="Collapse sidebar">
            <ChevronsLeft className="h-5 w-5" />
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))}
                  tooltip={item.label}
                  className="justify-start"
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    {state === "expanded" && <span>{item.label}</span>}
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-3 border-t">
         <SidebarMenuButton onClick={handleSignOut} className="justify-start" tooltip="Log Out">
            <LogOut className="h-5 w-5" />
            {state === "expanded" && <span>Log Out</span>}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
