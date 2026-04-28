import type { SystemStatus } from '@/entities/system/model/types';

const CACHE_PREFIXES = ['dplog_vol_', 'dplog_rt_', 'keyword_cooldown_'];

export function countLocalCacheKeys(): number {
  if (typeof window === 'undefined') return 0;
  let count = 0;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i) || '';
    if (CACHE_PREFIXES.some(prefix => key.startsWith(prefix))) count += 1;
  }
  return count;
}

export function clearLocalAppCache(): number {
  if (typeof window === 'undefined') return 0;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i) || '';
    if (CACHE_PREFIXES.some(prefix => key.startsWith(prefix))) keys.push(key);
  }
  keys.forEach(key => localStorage.removeItem(key));
  return keys.length;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function buildDiagnosticText(status: SystemStatus): string {
  const lines = [
    '[D-PLOG 진단 정보]',
    `생성시각: ${new Date().toLocaleString('ko-KR')}`,
    `앱 버전: ${status.backend.version}`,
    `앱 모드: ${status.backend.appMode}`,
    `백엔드 연결: ${status.backend.connected ? 'OK' : 'FAILED'}`,
    `포트: ${status.backend.port}`,
    `DB 상태: ${status.database.exists ? 'OK' : 'MISSING'} (${status.database.location}, ${formatBytes(status.database.sizeBytes)})`,
    `정적 파일: ${status.staticAssets.indexExists ? 'OK' : 'MISSING'}`,
    `상점: ${status.store ? `${status.store.name} (#${status.store.id})` : '없음'}`,
    `상점 수집상태: ${status.store?.scrapeStatus || '-'}`,
    `상점 최종수정: ${formatDateTime(status.store?.updatedAt)}`,
    `대표키워드 수: ${status.store?.keywordsCount ?? 0}`,
    `최근 키워드 작업: ${status.keywordTask ? `${status.keywordTask.status} / ${status.keywordTask.seedKeyword}` : '-'}`,
    `브라우저 캐시 키: ${countLocalCacheKeys()}개`,
    `UserAgent: ${typeof navigator !== 'undefined' ? navigator.userAgent : '-'}`,
  ];
  return lines.join('\n');
}
