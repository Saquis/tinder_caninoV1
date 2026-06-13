import AsyncStorage from '@react-native-async-storage/async-storage';

// Si estás en emulador Android: 10.0.2.2
// Si estás en celu físico con tunnel: la IP de tu PC en la red local
// Si despliegas backend: la URL de Railway
const API_URL = 'http://192.168.100.4:3000/api';
const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

let accessToken = null;

export function setToken(token) {
  accessToken = token;
}

export function clearToken() {
  accessToken = null;
}

export function getToken() {
  return accessToken;
}

export async function saveTokens(access, refresh) {
  accessToken = access;
  await AsyncStorage.setItem(TOKEN_KEY, access || '');
  if (refresh) await AsyncStorage.setItem(REFRESH_KEY, refresh);
}

export async function loadTokens() {
  const access = await AsyncStorage.getItem(TOKEN_KEY);
  if (access) {
    accessToken = access;
    return true;
  }
  return false;
}

export async function clearTokens() {
  accessToken = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_KEY);
}

export async function api(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = 'Bearer ' + accessToken;

  const res = await fetch(API_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };

  return data;
}

// Para subir archivos (FormData con foto)
export async function apiUpload(method, path, formData) {
  const headers = {};
  if (accessToken) headers['Authorization'] = 'Bearer ' + accessToken;
  // NO poner Content-Type — fetch lo setea automático con boundary

  const res = await fetch(API_URL + path, {
    method,
    headers,
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };

  return data;
}

// Auto-refresh si el token expiró
export async function apiWithRefresh(method, path, body) {
  try {
    return await api(method, path, body);
  } catch (error) {
    if (error.status === 401) {
      const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
      if (!refreshToken) throw error;

      try {
        const refreshRes = await fetch(API_URL + '/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshRes.ok) {
          await clearTokens();
          throw error;
        }

        const tokens = await refreshRes.json();
        await saveTokens(tokens.accessToken, tokens.refreshToken);
        return await api(method, path, body);
      } catch {
        await clearTokens();
        throw error;
      }
    }
    throw error;
  }
}
