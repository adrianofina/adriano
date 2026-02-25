// lib/api-client.ts
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export async function apiFetch<T>(
  url: string, 
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  })

  // Try to parse JSON, but handle empty responses
  let data: ApiResponse<T>
  try {
    data = await res.json()
  } catch (e) {
    throw new Error(`Invalid JSON response from ${url} (Status: ${res.status})`)
  }

  if (!data.success) {
    throw new Error(data.error || `API Error: ${res.status}`)
  }

  return data.data as T
}

// Convenience methods
export const api = {
  get: <T>(url: string) => apiFetch<T>(url),
  
  post: <T>(url: string, body: any) => 
    apiFetch<T>(url, { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),
  
  put: <T>(url: string, body: any) => 
    apiFetch<T>(url, { 
      method: 'PUT', 
      body: JSON.stringify(body) 
    }),
  
  delete: <T>(url: string) => 
    apiFetch<T>(url, { method: 'DELETE' }),
}
