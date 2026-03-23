import { useEffect, useState } from 'react';
import { Zap, Database, CheckCircle2, Loader } from 'lucide-react';
import { Card } from './ui/Card';

interface Props {
    phase: 'uploading' | 'analyzing' | 'done';
}

export default function LoadingScreen({ phase }: Props) {
    const [progress, setProgress] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (phase === 'uploading') return Math.min(35, prev + 1);
                if (phase === 'analyzing') return Math.min(85, prev + 0.6);
                if (phase === 'done') return 100;
                return prev;
            });
        }, 80);
        return () => clearInterval(interval);
    }, [phase]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const messages = {
        uploading: { title: 'Uploading', desc: 'Securing your data', color: '#8b5cf6' },
        analyzing: { title: 'Analyzing', desc: 'Processing intelligence', color: '#1e293b' },
        done: { title: 'Complete!', desc: 'Your insights await', color: '#10b981' }
    };

    const msg = messages[phase];

    return (
        <div className="w-full min-h-screen flex items-center justify-center px-4 py-14">
            <Card className="w-full max-w-lg rounded-3xl p-6" tone="default">
                <div className="flex items-start gap-4">
                    <div
                        className="w-11 h-11 rounded-2xl border flex items-center justify-center"
                        style={{
                            backgroundColor: 'rgba(139, 92, 246, 0.08)',
                            borderColor: 'rgba(139, 92, 246, 0.28)'
                        }}
                    >
                        {phase === 'uploading' && <Zap size={20} style={{ color: msg.color }} />}
                        {phase === 'analyzing' && <Loader size={20} style={{ color: msg.color }} />}
                        {phase === 'done' && <CheckCircle2 size={20} style={{ color: '#10b981' }} />}
                    </div>

                    <div className="min-w-0">
                        <h1 className="text-2xl font-display font-bold text-slate-100">{msg.title}</h1>
                        <p className="text-sm text-slate-400 mt-1">{msg.desc}</p>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                        <span className="text-sm font-bold text-slate-200" style={{ color: msg.color }}>
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <div className="h-3 bg-slate-800 border border-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-[width] duration-300"
                            style={{
                                width: `${progress}%`,
                                background: `linear-gradient(90deg, ${msg.color}, rgba(30,41,59,0.2))`
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time elapsed</span>
                        <span className="text-sm font-mono text-slate-200" style={{ color: msg.color }}>
                            {formatTime(seconds)}
                        </span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2">
                    {[
                        { label: 'Upload', active: phase === 'uploading' || phase === 'analyzing' || phase === 'done', Icon: Zap },
                        { label: 'Process', active: phase === 'analyzing' || phase === 'done', Icon: Database },
                        { label: 'Done', active: phase === 'done', Icon: CheckCircle2 }
                    ].map(({ label, active, Icon }, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold"
                            style={{
                                backgroundColor: active ? 'rgba(139, 92, 246, 0.10)' : 'rgba(2, 6, 23, 0.2)',
                                borderColor: active ? 'rgba(139, 92, 246, 0.28)' : 'rgba(71, 85, 105, 0.55)'
                            }}
                        >
                            <Icon size={14} style={{ color: active ? msg.color : '#64748b' }} />
                            {label}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
