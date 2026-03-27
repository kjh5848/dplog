/**
 * [역할]   숫자 카운트업 애니메이션 훅
 * [입력]   end: 목표 숫자, duration: 애니메이션 시간(ms)
 * [출력]   {count: 현재카운트, setIsVisible: 가시성설정}
 * [NOTE]   Pure Hook · IntersectionObserver 연동
 */

import { useState, useEffect } from "react";

export const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, isVisible]);

  return { count, setIsVisible };
}; 