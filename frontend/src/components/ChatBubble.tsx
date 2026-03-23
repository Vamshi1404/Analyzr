import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, fetchChatOpener } from '../lib/api';
import type { ChatMessage } from '../lib/types';
import { Send, X, MessageSquare, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    sessionId: string;
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
    const isUser = msg.role === 'user';
    return (
        <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[90%] p-6 text-[13px] leading-[1.7] shadow-sm border ${
                isUser 
                ? 'bg-black text-white border-black' 
                : 'bg-white text-black border-border'
            }`}>
                 {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('-') || line.match(/^\d\./) ? 'ml-4' : ''}>
                        {line}
                    </p>
                 ))}
            </div>
        </div>
    );
}

export default function ChatBubble({ sessionId }: Props) {
    const [open, setOpen] = useState(false);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function loadOpener() {
            try {
                const res = await fetchChatOpener(sessionId);
                if (res.message) {
                    setHistory([{ role: 'assistant', content: res.message }]);
                }
            } catch (e) {
                console.error('Failed to fetch opener', e);
            }
        }
        loadOpener();
    }, [sessionId]);

    useEffect(() => {
        if (open) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [history, loading, open]);

    async function send(msg?: string) {
        const text = (msg ?? input).trim();
        if (!text || loading) return;
        const userMsg: ChatMessage = { role: 'user', content: text };
        setHistory(h => [...h, userMsg]);
        setInput('');
        setLoading(true);
        try {
            const res = await sendChatMessage({
                session_id: sessionId,
                message: text,
                history: [...history, userMsg],
            });
            setHistory(h => [...h, { role: 'assistant', content: res.reply }]);
        } catch {
            setHistory(h => [...h, { role: 'assistant', content: 'Autonomous synthesis failed. Verify backend infrastructure.' }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`fixed top-0 right-0 h-full z-[9999] transition-all duration-700 ease-in-out ${open ? 'w-[500px]' : 'w-0'}`}>
            {/* Toggle Handle */}
            <button 
                onClick={() => setOpen(!open)}
                className={`absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-14 h-48 bg-black text-white flex flex-col items-center justify-center gap-6 border-l border-white/10 group transition-all ${open ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] [writing-mode:vertical-lr] rotate-180">Assistant</span>
            </button>

            {/* Sidebar Content */}
            <div className="w-full h-full bg-white border-l border-black shadow-[ -40px_0_80px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-10 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent text-white flex items-center justify-center">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg">Leela Engine</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">System Active</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="w-10 h-10 flex items-center justify-center border border-border hover:bg-black hover:text-white transition-all">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-10 bg-secondary/10">
                    {history.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
                    {loading && (
                        <div className="flex gap-2 p-6 bg-secondary/30 w-fit animate-pulse mb-8">
                             <span className="text-[10px] font-black uppercase tracking-widest">Synthesizing Response...</span>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input Area */}
                <div className="p-10 border-t border-border">
                    <div className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                            {['Executive Summary', 'Market Anomalies', 'Risk Profile'].map(s => (
                                <button key={s} onClick={() => send(s)} className="px-4 py-2 border border-border text-[10px] font-black uppercase tracking-widest hover:border-black transition-all">
                                    {s}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <input 
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                                placeholder="Consult the dataset..."
                                className="w-full border-b border-black py-4 text-sm font-medium outline-none placeholder:opacity-30"
                            />
                            <button onClick={() => send()} disabled={!input.trim() || loading} className="absolute right-0 bottom-4 text-black disabled:opacity-20 hover:scale-110 transition-transform">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
