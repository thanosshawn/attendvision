"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Camera,
  ShieldCheck,
  ScanFace,
  LogOut,
  ChevronsLeft,
  ChevronsRight
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
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/attendance', label: 'Attendance', icon: Camera },
  { href: '/employees', label: 'Employees', icon: Users },
  { href: '/logs', label: 'Attendance Logs', icon: ClipboardList },
  { href: '/face-validator', label: 'Face Validator', icon: ShieldCheck },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { state, toggleSidebar, open } = useSidebar();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="flex items-center justify-between p-3 border-b">
        <Link href="/dashboard" className={cn(
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
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
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
