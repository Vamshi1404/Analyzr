import axios from 'axios';
import type {
    UploadResponse,
    AnalysisResponse,
    VisualizationsResponse,
    ChatRequest,
    ChatResponse,
    PlaygroundRequest,
    PlaygroundResponse,
} from './types';

function normalizeApiUrl(raw: string | undefined): string {
    const url = (raw ?? '').trim().replace(/\/+$/, '');
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
}

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);
const BASE = `${API_URL}/api`;

/** Prefix /static/... paths with the backend base URL in production */
export const assetUrl = (path: string) =>
    `${API_URL}${path}`;

// ── Upload ────────────────────────────────────────────────────────────────────
export async function uploadFiles(files: File[]): Promise<UploadResponse> {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const { data } = await axios.post<UploadResponse>(`${BASE}/upload`, form);
    return data;
}

// ── Analysis ──────────────────────────────────────────────────────────────────
export async function runAnalysis(sessionId: string): Promise<AnalysisResponse> {
    const { data } = await axios.post<AnalysisResponse>(`${BASE}/analysis/${sessionId}`);
    return data;
}

// ── Visualizations ────────────────────────────────────────────────────────────
export async function fetchVisualizations(sessionId: string): Promise<VisualizationsResponse> {
    const { data } = await axios.get<VisualizationsResponse>(`${BASE}/visualizations/${sessionId}`);
    return data;
}

// ── AI Opener ──────────────────────────────────────────────────
export async function fetchChatOpener(sessionId: string): Promise<{ message: string }> {
    if (!sessionId) return { message: "" };
    const { data } = await axios.get<{ message: string }>(`${BASE}/analysis/${sessionId}/opener`);
    return data;
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
    const { data } = await axios.post<ChatResponse>(`${BASE}/chat`, payload);
    return data;
}

// ── Playground ────────────────────────────────────────────────────────────────
export async function runPlayground(payload: PlaygroundRequest): Promise<PlaygroundResponse> {
    const { data } = await axios.post<PlaygroundResponse>(`${BASE}/playground`, payload);
    return data;
}

// ── Report ────────────────────────────────────────────────────────────────────
export function buildReportUrl(
    sessionId: string,
    format: 'pdf' | 'html' | 'json',
    reportType: 'executive' | 'technical' | 'audit' = 'executive'
): string {
    return `${BASE}/report/${sessionId}?format=${format}&report_type=${reportType}`;
}
