import { auth } from "./auth-client";

const API = process.env.NEXT_PUBLIC_API_BASE!;

export async function api(path: string, init: RequestInit = {}) {
  const token = auth.get();
  const headers = new Headers(init.headers);

  if (!(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API}${path.startsWith("/") ? "" : "/"}${path}`, {
    ...init,
    headers,
  });

  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}
