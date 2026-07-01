const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data && (data.message as string)) || `Terjadi kesalahan (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

export const apiGet = <T = unknown>(p: string) => api<T>(p);
export const apiPost = <T = unknown>(p: string, body?: unknown) =>
  api<T>(p, { method: "POST", body: JSON.stringify(body ?? {}) });
export const apiPatch = <T = unknown>(p: string, body?: unknown) =>
  api<T>(p, { method: "PATCH", body: JSON.stringify(body ?? {}) });
export const apiPut = <T = unknown>(p: string, body?: unknown) =>
  api<T>(p, { method: "PUT", body: JSON.stringify(body ?? {}) });
export const apiDelete = <T = unknown>(p: string) =>
  api<T>(p, { method: "DELETE" });

export function rp(n: number | string): string {
  const num = typeof n === "string" ? parseFloat(n) : n;
  return "Rp " + Math.round(num || 0).toLocaleString("id-ID");
}
