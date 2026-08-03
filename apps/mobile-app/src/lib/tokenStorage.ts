import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'worklink.accessToken';
const SESSION_KEY = 'worklink.session';

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setStoredToken(
  token: string | null,
): Promise<void> {
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function getStoredSession<T>(): Promise<T | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setStoredSession(
  session: unknown | null,
): Promise<void> {
  if (session) {
    await SecureStore.setItemAsync(
      SESSION_KEY,
      JSON.stringify(session),
    );
  } else {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}
