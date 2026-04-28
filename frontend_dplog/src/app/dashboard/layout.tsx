import React from 'react';
import { AppShell } from '@/widgets/app-shell/ui/AppShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
