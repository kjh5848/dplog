import { NextResponse } from "next/server";
import { logError, logInfo } from "@/src/utils/logger";
import { buildCookieHeader } from "@/utils/server/buildCookieHeader";

type HeadersInput = HeadersInit | undefined;

export interface ProxyOptions {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
  cache?: RequestCache;
  label?: string;
}

export interface BackendJsonResult<T = unknown> {
  status: number;
  ok: boolean;
  data: T | null;
  text: string;
}

export async function proxyToBackend(
  path: string,
  options: ProxyOptions = {}
): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    logError('[apiProxy] 환경설정 누락', new Error('NEXT_PUBLIC_API_URL is not configured'));
    return NextResponse.json(
      { code: -1, message: 'API base URL이 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const targetUrl = `${baseUrl}${normalizedPath}`;
  const cookieHeader = await buildCookieHeader();
  const headers = new Headers(options.headers as HeadersInput);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (cookieHeader && !headers.has('Cookie')) {
    headers.set('Cookie', cookieHeader);
  }

  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers,
    body: options.body ?? null,
    cache: options.cache ?? 'no-store',
  };

  const label = options.label ?? normalizedPath;

  logInfo('[apiProxy] 백엔드 요청 시작', {
    label,
    targetUrl,
    method: init.method,
    hasCookie: Boolean(cookieHeader),
  });

  try {
    const response = await fetch(targetUrl, init);

    logInfo('[apiProxy] 백엔드 요청 완료', {
      label,
      status: response.status,
      ok: response.ok,
    });

    return response;
  } catch (error) {
    logError('[apiProxy] 백엔드 요청 오류', error as Error, { label, targetUrl });
    throw error;
  }
}

export async function proxyBackendJson<T = any>(
  path: string,
  options: ProxyOptions = {}
): Promise<BackendJsonResult<T>> {
  const response = await proxyToBackend(path, options);
  const text = await response.text();
  let parsed: T | null = null;

  if (text) {
    try {
      parsed = JSON.parse(text) as T;
    } catch (error) {
      logError('[apiProxy] JSON 파싱 실패', error as Error, {
        label: options.label ?? path,
      });
    }
  }

  if (!response.ok) {
    logError('[apiProxy] 백엔드 JSON 오류', new Error(`status ${response.status}`), {
      label: options.label ?? path,
      body: text,
    });
  }

  return {
    status: response.status,
    ok: response.ok,
    data: parsed,
    text,
  };
}
