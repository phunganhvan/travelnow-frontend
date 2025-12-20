const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  const token = typeof window !== 'undefined'
    ? window.localStorage.getItem('travelnow_token')
    : null;

  if (token && !finalHeaders.Authorization) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers: finalHeaders,
    credentials: 'include'
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function post(path, body, options = {}) {
  return request(path, { ...options, method: 'POST', body });
}

export function get(path, options = {}) {
  return request(path, { ...options, method: 'GET' });
}

export function put(path, body, options = {}) {
  return request(path, { ...options, method: 'PUT', body });
}

export { API_BASE_URL };
