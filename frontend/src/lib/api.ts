const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/Fragged/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const data = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? "Request failed");
  }
  return data;
}

export const api = {
  register: (payload: Record<string, unknown>) =>
    request<{ success: boolean; user: unknown; message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload: Record<string, unknown>) =>
    request<{ success: boolean; user: unknown; message: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logout: () =>
    request<{ success: boolean; message: string }>("/auth/logout", {
      method: "POST",
    }),
  profile: () => request<{ success: boolean; user: unknown }>("/auth/profile"),
};
