const STORAGE_KEY = 'mangaplus:profile-photo';
const CHANGE_EVENT = 'mangaplus:profile-photo-change';

/**
 * Firebase Storage is not enabled for this project, so a picture picked from
 * the device is kept on this browser only (per account) while a picture URL is
 * saved on the Firebase account and follows the user everywhere.
 */
function readStore(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, string>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Private mode or a full quota: the account picture still works.
  }
}

export function getLocalPhoto(uid: string): string | null {
  return readStore()[uid] ?? null;
}

export function setLocalPhoto(uid: string, dataUrl: string | null): void {
  const store = readStore();
  if (dataUrl) store[uid] = dataUrl;
  else delete store[uid];
  writeStore(store);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeToLocalPhoto(listener: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}

/**
 * Scales a chosen picture down before storing it, so a multi-megabyte phone
 * photo does not exhaust the localStorage quota.
 */
export function readImageFile(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('not-an-image'));
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('canvas-unavailable'));
        return;
      }
      const side = Math.min(image.width, image.height);
      context.drawImage(
        image,
        (image.width - side) / 2,
        (image.height - side) / 2,
        side,
        side,
        0,
        0,
        size,
        size,
      );
      resolve(canvas.toDataURL('image/jpeg', 0.86));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('invalid-image'));
    };
    image.src = url;
  });
}
