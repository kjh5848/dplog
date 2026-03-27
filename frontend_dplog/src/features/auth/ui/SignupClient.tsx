'use client';

import { SignupForm } from "./SignupForm";

export const SignupClient = () => {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden w-full max-w-2xl">
      {/* Background Gradients */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col space-y-2 text-center mb-8 relative z-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          D-PLOG 회원가입
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          사장님의 데이터 자생력을 위한 첫 걸음을 시작하세요
        </p>
      </div>
      
      <div className="relative z-10">
        <SignupForm />
      </div>
    </div>
  );
};
