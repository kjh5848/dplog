// hooks/useInViewCount.ts
import { useEffect, useRef } from "react";

export const useInViewCount = (
  setIsVisible: (v: boolean) => void,
  options: IntersectionObserverInit = { threshold: 0.3 }
) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);   // → 카운트-업 훅에서 애니메이션 시작
        obs.disconnect();
      }
    }, options);

    obs.observe(el);
    return () => obs.disconnect();
  }, [setIsVisible, options]);

  return ref;
};
