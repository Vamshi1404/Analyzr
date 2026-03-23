import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, Upload, Loader2 } from 'lucide-react';
import { sendChatMessage } from '../lib/api';
import { loadSession } from '../lib/sessionStore';
import type { ChatMessage } from '../lib/types';

const SUGGESTIONS = [
    'What are the top insights from this data?',
    'Are there any anomalies I should investigate?',
    'Which features are most correlated?',
    'What business actions do you recommend?',
    'Is this dataset suitable for machine learning?',
];

function MessageBubble({ msg }: { msg: ChatMessage }) {
    const isUser = msg.role === 'user';
    return (
        <div style={{ display: 'flex', gap: 12, justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 16, animation: 'fadeUp 0.3s ease both' }}>
            {!isUser && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Bot size={16} color="white" />
                </div>
            )}
            <div style={{
                maxWidth: '72%', padding: '12px 16px', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isUser ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--bg-card)',
                border: isUser ? 'none' : '1px solid var(--border)',
                fontSize: 14, lineHeight: 1.65, color: 'var(--text-primary)'
            }}>
                {msg.content}
            </div>
            {isUser && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <User size={16} color="var(--indigo-light)" />
                </div>
            )}
        </div>
    );
}

export default function ChatPage() {
    const navigate = useNavigate();
    const sessionId = loadSession();
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading]);

    if (!sessionId) return (
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <Upload size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>No datasets uploaded yet.</p>
            <button className="btn-glow" style={{ padding: '10px 24px' }} onClick={() => navigate('/')}>Upload CSV Files</button>
        </div>
    );

    async function send(msg?: string) {
        const text = msg ?? input.trim();
        if (!text || loading) return;
        const userMsg: ChatMessage = { role: 'user', content: text };
        setHistory((p) => [...p, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await sendChatMessage({ session_id: sessionId!, message: text, history });
            setHistory((p) => [...p, { role: 'assistant', content: res.reply }]);
        } catch {
            setHistory((p) => [...p, { role: 'assistant', content: 'Failed to get a response. Ensure the backend and Ollama are running.' }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fade-up" style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800 }}>AI <span className="gradient-text">Chat Analyst</span></h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Ask anything about your uploaded datasets.</p>
            </div>

            {/* Messages */}
            <div className="glass" style={{ flex: 1, overflowY: 'auto', padding: 24, marginBottom: 16 }}>
                {history.length === 0 && (
                    <div style={{ textAlign: 'center', paddingTop: 24 }}>
                        <Bot size={44} color="var(--indigo-light)" style={{ margin: '0 auto 12px' }} />
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
                            Ask me anything about your data. I'll use the analysis to answer accurately.
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                            {SUGGESTIONS.map((s) => (
                                <button key={s} onClick={() => send(s)} className="btn-outline"
                                    style={{ padding: '7px 14px', fontSize: 13 }}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {history.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
                {loading && (
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={16} color="white" />
                        </div>
                        <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Loader2 size={14} className="pulse-loader" color="var(--indigo-light)" />
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Thinking…</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 10 }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder="Ask about your data…"
                    disabled={loading}
                    style={{
                        flex: 1, padding: '12px 16px', borderRadius: 12, fontSize: 14,
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', outline: 'none',
                    }}
                />
                <button onClick={() => send()} disabled={!input.trim() || loading} className="btn-glow"
                    style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
}
