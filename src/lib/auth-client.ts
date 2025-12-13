const KEY = "wavvy_access_token";

export const auth = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(KEY)),
  set: (t: string) => localStorage.setItem(KEY, t),
  clear: () => localStorage.removeItem(KEY),
};
