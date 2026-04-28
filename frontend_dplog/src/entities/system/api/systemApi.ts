import { get } from '@/shared/api';
import type { SystemStatus } from '../model/types';

export async function getSystemStatus(): Promise<SystemStatus> {
  return get<SystemStatus>('/v1/system/status');
}

export function getDatabaseBackupUrl(): string {
  return '/v1/system/backup/db';
}
