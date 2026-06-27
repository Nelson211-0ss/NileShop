import { getStorageItem, setStorageItem } from '@nileshop/utils';

export const CART_SESSION_KEY = 'nileshop_cart_session';

export function getOrCreateCartSessionId(): string {
  let sessionId = getStorageItem(CART_SESSION_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    setStorageItem(CART_SESSION_KEY, sessionId);
  }

  return sessionId;
}
