const STORAGE_KEY = 'mangaplus:account-details';
const CHANGE_EVENT = 'mangaplus:account-details-change';

/**
 * The website has no database, and Firebase Auth only stores a display name and
 * a photo URL. Country and gender are therefore kept in this browser, per
 * account, next to the picture picked from the device.
 */
export interface AccountDetails {
  country: string;
  gender: string;
}

const emptyDetails: AccountDetails = { country: '', gender: '' };

function readStore(): Record<string, AccountDetails> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, AccountDetails>) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, AccountDetails>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Private mode or a full quota: the rest of the account page still works.
  }
}

export function getAccountDetails(uid: string): AccountDetails {
  return { ...emptyDetails, ...(readStore()[uid] ?? {}) };
}

export function setAccountDetails(uid: string, details: AccountDetails): void {
  const store = readStore();
  store[uid] = { ...emptyDetails, ...details };
  writeStore(store);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
