import { NextResponse } from "next/server";
import { logError, logInfo } from "@/src/utils/logger";

interface DebugOptions<T = any> {
  label: string;
  extractSample?: (parsed: T) => { count?: number; sample?: unknown };
  enabledParamKeys?: string[];
}

const DEFAULT_DEBUG_VALUES = ["1", "true", "yes"];

export async function debugJsonSample(
  request: Request,
  upstream: Response,
  { label, extractSample, enabledParamKeys }: DebugOptions = { label: "debug" }
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const keys = enabledParamKeys ?? ["debug"];
    const enabled = keys.some((key) => {
      const value = url.searchParams.get(key)?.toLowerCase();
      return DEFAULT_DEBUG_VALUES.includes(value ?? "");
    });

    if (!enabled) {
      return upstream;
    }

    const bodyText = await upstream.text();
    const contentType = upstream.headers.get("content-type") ?? "application/json";

    if (contentType.includes("application/json")) {
      try {
        const parsed = JSON.parse(bodyText);
        const { count, sample } = extractSample ? extractSample(parsed) : {};

        logInfo(`[debugJsonSample] ${label}`, {
          count,
          sample,
        });
      } catch (error) {
        logError(`[debugJsonSample] JSON parse failed (${label})`, error as Error);
      }
    }

    return new NextResponse(bodyText, {
      status: upstream.status,
      headers: new Headers(upstream.headers),
    });
  } catch (error) {
    logError(`[debugJsonSample] failed (${label})`, error as Error);
    return upstream;
  }
}
