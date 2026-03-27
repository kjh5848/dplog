import { cookies } from "next/headers";

export async function buildCookieHeader(): Promise<string | undefined> {
  const cookieStore = await cookies(); // ✅ await 붙이기

  const entries = cookieStore.getAll();

  if (entries.length === 0) {
    return undefined;
  }

  return entries.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}