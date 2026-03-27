'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  Users, 
  Settings, 
  HelpCircle,
  Search,
  Bell,
  User
} from 'lucide-react';
import Link from 'next/link';

const SidebarItem = ({ icon: Icon, label, href, active }: any) => (
  <Link 
    href={href}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
      active 
        ? "bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold" 
        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
    )}
  >
    <Icon className={cn("size-5 transition-transform duration-300 group-hover:scale-110", active && "text-blue-600 dark:text-blue-400")} />
    <span className="text-sm">{label}</span>
  </Link>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-white/10 flex flex-col p-6 backdrop-blur-xl bg-white/50 dark:bg-black/20 z-30">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <span className="material-icons-round text-xl">hub</span>
          </div>
          <span className="text-xl font-black tracking-tighter">D-PLOG</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="대시보드" href="/dashboard" active />
          <SidebarItem icon={BarChart3} label="매출 분석" href="#" />
          <SidebarItem icon={FileText} label="내 가게 진단" href="/dashboard/report" />
          <SidebarItem icon={Users} label="고객 관리" href="#" />
        </nav>

        <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-2">
          <SidebarItem icon={Settings} label="설정" href="#" />
          <SidebarItem icon={HelpCircle} label="도움말" href="#" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-8 backdrop-blur-md bg-white/30 dark:bg-black/10 z-20">
          <div className="flex items-center gap-4 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/5 w-96 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white dark:focus-within:bg-white/10">
            <Search className="size-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="데이터, 리포트 검색..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <Bell className="size-5 text-slate-500" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">김사장님</p>
                <p className="text-xs text-slate-500">Premium Plan</p>
              </div>
              <div className="size-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-105 transition-transform">
                <User className="size-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
        </div>
      </main>
    </div>
  );
}
