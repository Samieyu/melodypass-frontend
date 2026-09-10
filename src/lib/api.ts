export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type ColdStartListener = (isSlow: boolean) => void;
const coldStartListeners: Set<ColdStartListener> = new Set();

export function subscribeColdStart(listener: ColdStartListener) {
  coldStartListeners.add(listener);
  return () => coldStartListeners.delete(listener);
}

function notifyColdStart(isSlow: boolean) {
  coldStartListeners.forEach((fn) => fn(isSlow));
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Get local sessionToken and adminToken fallback
  const storedSessionToken = typeof window !== 'undefined' ? localStorage.getItem('melodypass_session_token') : null;
  const storedAdminToken = typeof window !== 'undefined' ? localStorage.getItem('melodypass_admin_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (storedSessionToken && !headers['x-session-token']) {
    headers['x-session-token'] = storedSessionToken;
  }

  if (storedAdminToken && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${storedAdminToken}`;
  }

  // Cold start timer (3 seconds threshold)
  let timer: NodeJS.Timeout | null = setTimeout(() => {
    notifyColdStart(true);
  }, 3000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // send httpOnly cookies automatically
    });

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    notifyColdStart(false);

    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        data?.message || (Array.isArray(data?.message) ? data.message.join(', ') : 'Request failed');
      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  } catch (error) {
    if (timer) {
      clearTimeout(timer);
    }
    notifyColdStart(false);
    throw error;
  }
}
