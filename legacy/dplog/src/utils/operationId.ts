const OP_PREFIX = "operation";

const memoryStore = new Map<string, string>();

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined" || !window?.sessionStorage) {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function buildStorageKey(action: string, userId?: string | number | null, subscriptionId?: string | null) {
  const normalizedAction = action || "unknown";
  const normalizedUserId = userId ? String(userId) : "anon";
  const normalizedSubscriptionId = subscriptionId ? String(subscriptionId) : "none";
  return `${OP_PREFIX}:${normalizedAction}:${normalizedUserId}:${normalizedSubscriptionId}`;
}

function persistOperation(key: string, operationId: string) {
  const storage = getSessionStorage();

  if (storage) {
    try {
      storage.setItem(key, operationId);
      return;
    } catch {
      // fall back to memory store
    }
  }

  memoryStore.set(key, operationId);
}

function readOperation(key: string): string | null {
  const storage = getSessionStorage();

  if (storage) {
    try {
      const value = storage.getItem(key);
      if (value) {
        return value;
      }
    } catch {
      // fall back to memory store
    }
  }

  return memoryStore.get(key) ?? null;
}

function removeOperation(key: string) {
  const storage = getSessionStorage();

  if (storage) {
    try {
      storage.removeItem(key);
    } catch {
      // fall through
    }
  }

  memoryStore.delete(key);
}

export function ensureOperationId(params: {
  action: string;
  subscriptionId?: string | null;
  userId?: string | number | null;
  forceNew?: boolean;
}): { operationId: string; storageKey: string } {
  const { action, subscriptionId, userId, forceNew = false } = params;
  const storageKey = buildStorageKey(action, userId, subscriptionId);

  if (!forceNew) {
    const existing = readOperation(storageKey);
    if (existing) {
      return { operationId: existing, storageKey };
    }
  }

  const opId = `op-${userId ? String(userId) : "anon"}-${Date.now()}-${randomId()}`;
  persistOperation(storageKey, opId);
  return { operationId: opId, storageKey };
}

export function clearOperationId(params: {
  action: string;
  subscriptionId?: string | null;
  userId?: string | number | null;
}) {
  const { action, subscriptionId, userId } = params;
  const storageKey = buildStorageKey(action, userId, subscriptionId);
  removeOperation(storageKey);
}
