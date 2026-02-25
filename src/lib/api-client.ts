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
  try {
    const res = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    })

    // Check if response is ok
    if (!res.ok) {
      const text = await res.text()
      console.error('API Error Response:', { status: res.status, text })
      throw new Error(`API Error: ${res.status} - ${text.substring(0, 100)}`)
    }

    // Try to parse JSON
    let data: ApiResponse<T>
    try {
      data = await res.json()
    } catch (e) {
      const text = await res.text()
      console.error('Invalid JSON response:', { status: res.status, text: text.substring(0, 200) })
      throw new Error(`Invalid JSON response from ${url}`)
    }

    if (!data.success) {
      throw new Error(data.error || `API Error: ${res.status}`)
    }

    return data.data as T

  } catch (error) {
    console.error(`API Fetch Error (${url}):`, error)
    throw error
  }
}

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
