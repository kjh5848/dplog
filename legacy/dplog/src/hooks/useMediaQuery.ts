"use client";

import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

/**
 * [Role]   모바일 디바이스 감지 훅
 * [Input]  -
 * [Output] 모바일 여부 (boolean)
 * [NOTE]   useMediaQuery 기반 구현
 */
export const useIsMobile = (): boolean => {
  return useMediaQuery('(max-width: 767px)');
};

