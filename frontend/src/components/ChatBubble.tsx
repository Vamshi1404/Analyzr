import { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatMessage, fetchChatOpener } from '../lib/api';
import type { ChatMessage } from '../lib/types';
import { Send, Sparkles, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface Props {
    sessionId: string;
    pendingPrompt: string | null;
    onPendingPromptConsumed: () => void;
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
    const isUser = msg.role === 'user';
    return (
        <div className={`flex w-full mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div 
                className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed border"
                style={{
                    backgroundColor: isUser ? 'rgba(139, 92, 246, 0.18)' : 'rgba(2, 6, 23, 0.35)',
                    color: isUser ? '#ffffff' : '#e2e8f0',
                    borderColor: isUser ? 'rgba(139, 92, 246, 0.35)' : 'rgba(71, 85, 105, 0.55)'
                }}
            >
                {msg.content.split('\n').map((line, i) => (
                    <p key={i} style={{ marginTop: i > 0 ? '0.25rem' : 0 }}>
                        {line}
                    </p>
                ))}
            </div>
        </div>
    );
}

export default function ChatBubble({
    sessionId,
    pendingPrompt,
    onPendingPromptConsumed,
}: Props) {
    const [open, setOpen] = useState(false);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [openerLoaded, setOpenerLoaded] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const historyRef = useRef<ChatMessage[]>([]);
    const promptQueueRef = useRef<string[]>([]);
    const processingQueueRef = useRef(false);
    const sessionIdRef = useRef(sessionId);

    useEffect(() => {
        sessionIdRef.current = sessionId;
    }, [sessionId]);

    useEffect(() => {
        async function loadOpener() {
            setOpenerLoaded(false);
            try {
                const res = await fetchChatOpener(sessionId);
                setHistory(res.message ? [{ role: 'assistant', content: res.message }] : []);
            } catch (e) {
                console.error('Failed to fetch opener', e);
                setHistory([]);
            } finally {
                setOpenerLoaded(true);
            }
        }
        loadOpener();
    }, [sessionId]);

    useEffect(() => {
        historyRef.current = history;
    }, [history]);

    useEffect(() => {
        if (open) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [history, loading, open]);

    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const userMsg: ChatMessage = { role: 'user', content: trimmed };
        const historyForApi = [...historyRef.current, userMsg];

        // Optimistic UI
        setHistory((h) => [...h, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await sendChatMessage({
                session_id: sessionIdRef.current,
                message: trimmed,
                history: historyForApi,
            });
            setHistory((h) => [...h, { role: 'assistant', content: res.reply }]);
        } catch {
            setHistory((h) => [
                ...h,
                { role: 'assistant', content: 'Unable to process your request. Please try again.' },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    const processPromptQueue = useCallback(async () => {
        if (!openerLoaded) return;
        if (processingQueueRef.current) return;
        processingQueueRef.current = true;
        try {
            while (promptQueueRef.current.length > 0) {
                const next = promptQueueRef.current.shift();
                if (!next) break;
                await sendMessage(next);
            }
        } finally {
            processingQueueRef.current = false;
        }
    }, [sendMessage, openerLoaded]);

    useEffect(() => {
        if (!pendingPrompt) return;
        promptQueueRef.current.push(pendingPrompt);
        setOpen(true);
        onPendingPromptConsumed();
        void processPromptQueue();
    }, [pendingPrompt, onPendingPromptConsumed, processPromptQueue]);

    useEffect(() => {
        if (!openerLoaded) return;
        if (promptQueueRef.current.length === 0) return;
        void processPromptQueue();
    }, [openerLoaded, processPromptQueue]);

    async function send(msg?: string) {
        const text = (msg ?? input).trim();
        if (!text || loading) return;
        await sendMessage(text);
    }

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* Chat Window */}
            {open && (
                <div 
                    className="absolute bottom-0 right-0 w-96 max-w-[calc(100vw-1.5rem)] h-[600px] bg-slate-950/95 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(2,6,23,0.55)]"
                >
                    {/* Header */}
                    <div 
                        className="p-3 text-slate-100 border-b border-slate-800 flex items-center justify-between flex-shrink-0 bg-slate-950/70"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-center">
                                <Sparkles size={16} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">AI Assistant</h3>
                                <p className="text-xs opacity-70">Always available</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="w-8 h-8 rounded-xl hover:bg-slate-800/60 flex items-center justify-center transition-colors border border-transparent hover:border-slate-700"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-950/10">
                        {history.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
                        {loading && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <div
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        border: '2px solid rgba(148, 163, 184, 0.35)',
                                        borderTopColor: '#8b5cf6',
                                        animation: 'rotate-slow 1s linear infinite'
                                    }}
                                />
                                <span>Thinking...</span>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-slate-800 bg-slate-950/35 flex-shrink-0">
                        <div className="space-y-3">
                            {/* Quick Actions */}
                            {history.length === 1 && (
                                <div className="flex flex-wrap gap-2">
                                    {['Summarize', 'Top Trends', 'Anomalies'].map(s => (
                                        <Button
                                            key={s}
                                            onClick={() => send(s)}
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-full px-3 w-auto"
                                        >
                                            {s}
                                        </Button>
                                    ))}
                                </div>
                            )}
                            
                            {/* Input */}
                            <div className="flex gap-2">
                                <Input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                                    placeholder="Ask anything..."
                                    className="flex-1 text-sm"
                                />
                                <Button
                                    onClick={() => send()}
                                    disabled={!input.trim() || loading}
                                    variant="primary"
                                    size="sm"
                                    className="w-10 px-0 justify-center"
                                >
                                    <Send size={16} fill="currentColor" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setOpen(!open)}
                className="w-14 h-14 rounded-full border border-purple-500/30 bg-purple-600/90 hover:bg-purple-600 shadow-sm text-white flex items-center justify-center transition-colors duration-200"
                style={{
                    opacity: open ? 0 : 1,
                    pointerEvents: open ? 'none' : 'auto',
                }}
                title="Open AI Assistant"
            >
                {open ? (
                    <ChevronLeft size={20} />
                ) : (
                    <MessageCircle size={20} fill="currentColor" />
                )}
            </button>
        </div>
    );
}
