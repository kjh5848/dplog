'use client';

import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { cn } from "@/shared/lib/utils";

export const LoginClient = () => {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col space-y-2 text-center mb-8 relative z-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          D-PLOG 로그인
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          서비스 이용을 위해 계정에 로그인해주세요
        </p>
      </div>
      
      <div className="relative z-10">
        <LoginForm />
      </div>
    </div>
  );
};
