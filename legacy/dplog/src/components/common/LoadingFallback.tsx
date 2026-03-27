/**
 * [Role]   로딩 상태를 표시하는 공통 컴포넌트
 * [Input]  message: 표시할 로딩 메시지, size: 로딩 크기, config: 로딩 설정 객체
 * [Output] 로딩 스피너와 메시지가 포함된 UI
 * [NOTE]   Pure Fn · Client Component
 */
"use client";

import { createLoadingConfig, LoadingType } from "@/src/utils/loading";

interface LoadingFallbackProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  type?: LoadingType;
  config?: { message: string; size: 'sm' | 'md' | 'lg' };
}

export default function LoadingFallback({ 
  message,
  size,
  type,
  config,
  ...props
}: LoadingFallbackProps) {
  // 설정 우선순위: config > type > props
  let finalConfig: { message: string; size: 'sm' | 'md' | 'lg' };
  
  if (config) {
    finalConfig = config;
  } else if (type) {
    finalConfig = createLoadingConfig(type, message);
  } else {
    finalConfig = {
      message: message || "로딩 중...",
      size: size || 'md'
    };
  }

  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4'
  };

  const textClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className={`${sizeClasses[finalConfig.size]} border-rank-primary border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
        <p className={`${textClasses[finalConfig.size]} font-medium text-gray-700`}>{finalConfig.message}</p>
      </div>
    </div>
  );
}
