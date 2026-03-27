"use client"; // Next.js에서 클라이언트 컴포넌트임을 명시

import { useEffect, useState } from 'react';

/**
 * 디바운스 처리를 위한 커스텀 훅
 * @param value - 디바운스 처리할 값
 * @param delay - 지연 시간 (밀리초)
 * @returns 디바운스 처리된 값
 */
const useDebounce = <T,>(value: T, delay: number): T => {
  // 디바운스된 값을 저장하는 상태
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 지정된 지연 시간 후에 값을 업데이트하는 타이머 설정
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 컴포넌트 언마운트 또는 값 변경 시 타이머 정리
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // value나 delay가 변경될 때마다 효과 재실행

  return debouncedValue;
};

export default useDebounce; 