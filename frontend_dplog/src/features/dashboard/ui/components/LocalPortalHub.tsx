'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Store, BarChart3, Sparkles, Search, FileText, PenTool, Instagram, MessageCircle, Video } from 'lucide-react';

const portalItems = [
  {
    title: '내 가게 관리',
    href: '/dashboard/stores/new',
    icon: Store,
    color: 'bg-blue-50 text-blue-500',
    colSpan: 'lg:col-span-2',
  },
  {
    title: '순위 조회',
    href: '/dashboard/ranking',
    icon: BarChart3,
    color: 'bg-emerald-50 text-emerald-500',
    colSpan: 'lg:col-span-1',
  },
  {
    title: '황금 키워드',
    href: '/dashboard/keywords',
    icon: Sparkles,
    color: 'bg-amber-50 text-amber-500',
    colSpan: 'lg:col-span-1',
  },
  {
    title: '실시간 조회',
    href: '/dashboard/realtime',
    icon: Search,
    color: 'bg-indigo-50 text-indigo-500',
    colSpan: 'lg:col-span-1',
  },
  {
    title: '내 가게 진단',
    href: '#',
    icon: FileText,
    color: 'bg-rose-50 text-rose-500 opacity-60',
    colSpan: 'lg:col-span-2',
    isUpcoming: true,
  },
  {
    title: '블로그 자동화',
    href: '#',
    icon: PenTool,
    color: 'bg-green-50 text-green-500 opacity-60',
    colSpan: 'lg:col-span-1',
    isUpcoming: true,
  },
  {
    title: '인스타 자동화',
    href: '#',
    icon: Instagram,
    color: 'bg-pink-50 text-pink-500 opacity-60',
    colSpan: 'lg:col-span-1',
    isUpcoming: true,
  },
  {
    title: '스레드 자동화',
    href: '#',
    icon: MessageCircle,
    color: 'bg-zinc-50 text-zinc-600 opacity-60',
    colSpan: 'lg:col-span-1',
    isUpcoming: true,
  },
  {
    title: '쇼츠 자동화',
    href: '#',
    icon: Video,
    color: 'bg-red-50 text-red-500 opacity-60',
    colSpan: 'lg:col-span-1',
    isUpcoming: true,
  },
];

const availableItems = portalItems.filter((item) => !item.isUpcoming);
const upcomingItems = portalItems.filter((item) => item.isUpcoming);

export function LocalPortalHub() {
  const router = useRouter();

  const handleCardClick = (href: string, isUpcoming?: boolean) => {
    if (isUpcoming) {
      alert('준비중인 기능입니다.');
      return;
    }
    router.push(href);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">
          안녕하세요, 사장님
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          원하시는 관리 메뉴를 선택해주세요.
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          사용 가능
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {availableItems.map((item, idx) => (
          <div
            onClick={() => handleCardClick(item.href, item.isUpcoming)}
            key={item.title}
            className={item.colSpan}
          >
            <motion.div
              whileHover={{ y: -6, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}
              whileTap={{ scale: 0.98 }}
              className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] p-6 lg:p-8 flex flex-col h-40 md:h-52 cursor-pointer transition-colors hover:border-slate-200 dark:hover:border-slate-700 shadow-sm relative ${item.isUpcoming ? 'grayscale-[30%]' : ''}`}
            >
              {item.isUpcoming && (
                <div className="absolute top-4 right-4 bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
                  준비중
                </div>
              )}

              <div className={`size-12 md:size-14 rounded-[18px] flex items-center justify-center mb-auto ${item.color}`}>
                <item.icon className="size-6 md:size-7" strokeWidth={2.5} />
              </div>
              <h2 className={`text-lg md:text-xl font-bold tracking-tight ${item.isUpcoming ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                {item.title}
              </h2>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          준비중
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {upcomingItems.map((item, idx) => (
          <div
            onClick={() => handleCardClick(item.href, item.isUpcoming)}
            key={item.title}
            className={item.colSpan}
          >
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] p-6 lg:p-8 flex flex-col h-40 md:h-52 cursor-pointer transition-colors hover:border-slate-200 dark:hover:border-slate-700 shadow-sm relative grayscale-[30%]"
            >
              <div className="absolute top-4 right-4 bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
                준비중
              </div>
              <div className={`size-12 md:size-14 rounded-[18px] flex items-center justify-center mb-auto ${item.color}`}>
                <item.icon className="size-6 md:size-7" strokeWidth={2.5} />
              </div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-400 dark:text-slate-500">
                {item.title}
              </h2>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
