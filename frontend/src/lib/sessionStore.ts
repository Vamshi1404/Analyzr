const KEY = 'analyzr_session_id';

export function saveSession(id: string): void {
    localStorage.setItem(KEY, id);
}

export function loadSession(): string | null {
    return localStorage.getItem(KEY);
}

export function clearSession(): void {
    localStorage.removeItem(KEY);
}
