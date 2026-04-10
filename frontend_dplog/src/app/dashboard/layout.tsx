'use client';

import React, { useState } from 'react';
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
  User,
  LogOut,
  Store,
  Sparkles,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/entities/auth/model/useAuthStore';
import { usePathname, useRouter } from 'next/navigation';

const SidebarItem = ({ icon: Icon, label, href, active, isCollapsed }: any) => (
  <Link 
    href={href}
    className={cn(
      "flex items-center gap-3 py-3 rounded-xl transition-all duration-300 group",
      isCollapsed ? "px-3 justify-center" : "px-4",
      active 
        ? "bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold" 
        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
    )}
    title={isCollapsed ? label : undefined}
  >
    <Icon className={cn("size-5 shrink-0 transition-transform duration-300 group-hover:scale-110", active && "text-blue-600 dark:text-blue-400")} />
    {!isCollapsed && <span className="text-sm truncate">{label}</span>}
  </Link>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#050505] text-slate-900 dark:text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "shrink-0 border-r border-slate-200 dark:border-white/10 flex flex-col py-6 backdrop-blur-xl bg-white/50 dark:bg-black/20 z-30 transition-all duration-300",
        isCollapsed ? "w-20 px-3" : "w-64 px-6"
      )}>
        <div className={cn("flex items-center mb-10 h-8", isCollapsed ? "justify-center" : "gap-2 px-2")}>
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <div className="size-8 shrink-0 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <span className="material-icons-round text-xl font-bold">D</span>
            </div>
            {!isCollapsed && <span className="text-xl font-black tracking-tighter truncate">D-PLOG</span>}
          </Link>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={Store} 
            label="내 가게" 
            href="/dashboard/stores/new" 
            active={pathname.startsWith('/dashboard/stores')}
            isCollapsed={isCollapsed} 
          />
          <SidebarItem 
            icon={BarChart3} 
            label="순위 조회" 
            href="/dashboard/ranking" 
            active={pathname.startsWith('/dashboard/ranking')}
            isCollapsed={isCollapsed} 
          />
          <SidebarItem 
            icon={Sparkles} 
            label="황금 키워드 발굴" 
            href="/dashboard/keywords" 
            active={pathname.startsWith('/dashboard/keywords')}
            isCollapsed={isCollapsed} 
          />
          <SidebarItem 
            icon={Search} 
            label="실시간 조회" 
            href="/dashboard/realtime" 
            active={pathname.startsWith('/dashboard/realtime')}
            isCollapsed={isCollapsed} 
          />
          <SidebarItem 
            icon={FileText} 
            label="내 가게 진단" 
            href="/dashboard/report" 
            active={pathname.startsWith('/dashboard/report')}
            isCollapsed={isCollapsed}
          />
          </nav>

        <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-2 flex flex-col">
          <SidebarItem icon={Settings} label="설정" href="#" isCollapsed={isCollapsed} />
          <SidebarItem icon={HelpCircle} label="도움말" href="#" isCollapsed={isCollapsed} />
          <button 
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 py-3 rounded-xl transition-all duration-300 w-full text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 mt-2",
              isCollapsed ? "px-3 justify-center" : "px-4"
            )}
            title="로그아웃"
          >
            <LogOut className="size-5 shrink-0" />
            {!isCollapsed && <span className="text-sm">로그아웃</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-8 backdrop-blur-md bg-white/30 dark:bg-black/10 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-500"
              title="사이드바 토글"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/5 w-64 lg:w-96 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white dark:focus-within:bg-white/10">
              <Search className="size-4 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="데이터, 리포트 검색..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <Bell className="size-5 text-slate-500" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{isLoggedIn ? user?.nickname : '게스트'}님</p>
                <p className="text-xs text-slate-500">{isLoggedIn ? 'Standard Plan' : '체험 중'}</p>
              </div>
              <div className="size-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-105 transition-transform">
                <User className="size-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 bg-slate-50/50 dark:bg-zinc-950 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
        </div>
      </main>
    </div>
  );
}
