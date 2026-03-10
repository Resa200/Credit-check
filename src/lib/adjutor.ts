const BASE_URL = import.meta.env.VITE_ADJUTOR_BASE_URL as string
const API_KEY = import.meta.env.VITE_ADJUTOR_API_KEY as string

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  })

  const json = await res.json()

  if (!res.ok || json.status === 'error' || json.status === 'failed') {
    throw new Error(json.message || 'An unexpected error occurred.')
  }

  return json as T
}

export const adjutor = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
}
