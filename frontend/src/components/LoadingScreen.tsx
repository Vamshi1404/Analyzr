import { useEffect, useState } from 'react';
import { Sparkles, Command, Shield, Database } from 'lucide-react';

interface Props {
    phase: 'uploading' | 'analyzing' | 'done';
}

const PHASES = [
    { id: 'uploading', label: 'Ingestion', icon: Command, desc: 'Establishing secure data stream' },
    { id: 'analyzing', label: 'Processing', icon: Database, desc: 'Executing analytical heuristics' },
    { id: 'ai', label: 'Insight Synthesis', icon: Sparkles, desc: 'Activating Leela engine' },
    { id: 'ready', label: 'System Ready', icon: Shield, desc: 'Diagnostic report complete' }
];

export default function LoadingScreen({ phase }: Props) {
    const [progress, setProgress] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Simulated progress within phases
        const interval = setInterval(() => {
            setProgress(prev => {
                if (phase === 'uploading') return Math.min(25, prev + 0.5);
                if (phase === 'analyzing') return Math.min(75, prev + 0.3);
                if (phase === 'done') return Math.min(99, prev + 0.8);
                return prev;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [phase]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full flex flex-col items-center justify-center space-y-24 py-24 animate-fade-in">
            {/* Visual Center - Pulsing Gold Orb / Hub */}
            <div className="relative">
                <div className="w-48 h-48 rounded-full border border-accent/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-2 border-accent/10 animate-pulse-gold" />
                    <div className="absolute inset-4 rounded-full border border-accent/20 animate-spin-slow" style={{ animationDuration: '10s' }} />
                    <div className="w-4 h-4 bg-accent shadow-[0_0_30px_#C5A059] relative z-10" />
                </div>
                {/* Orbital Labels around the hub */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 text-center">
                    <h4 className="opacity-100">System Processing</h4>
                </div>
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] text-accent">
                    {formatTime(seconds)} <span className="opacity-30">/</span> {Math.floor(progress)}%
                </div>
            </div>

            {/* Phase Architecture */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-4 gap-px bg-border border border-border">
                {PHASES.map((p, idx) => {
                    const isCurrent = (p.id === phase) || (phase === 'done' && p.id === 'ai');
                    const isPast = (phase === 'analyzing' && p.id === 'uploading') || (phase === 'done' && (p.id === 'uploading' || p.id === 'analyzing'));
                    const isSystemReady = phase === 'done' && p.id === 'ready';

                    return (
                        <div key={idx} className={`p-10 transition-all duration-700 ${isCurrent ? 'bg-white' : 'bg-secondary/50'}`}>
                            <div className="flex items-center justify-between mb-8">
                                <p className={`text-[9px] font-black tracking-[0.4em] uppercase ${isCurrent || isPast ? 'text-accent' : 'text-muted opacity-30'}`}>
                                    Step 0{idx + 1}
                                </p>
                                <p className="text-[9px] font-mono text-muted opacity-30">{p.id.toUpperCase()}</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <p className={`text-xl font-black uppercase tracking-tighter ${isCurrent || isPast || isSystemReady ? 'text-black' : 'text-muted opacity-20'}`}>
                                        {p.label}
                                    </p>
                                    {(isPast || isSystemReady) && <div className="w-1.5 h-1.5 bg-accent" />}
                                </div>
                                <p className={`text-[10px] font-black uppercase tracking-widest leading-relaxed ${isCurrent ? 'text-secondary' : 'text-muted opacity-30'}`}>
                                    {p.desc}
                                </p>
                            </div>
                            {isCurrent && (
                                <div className="mt-8 h-0.5 bg-border overflow-hidden">
                                    <div className="h-full bg-accent animate-shimmer" style={{ width: '60%' }} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Professional Disclaimer */}
            <div className="text-center space-y-4 opacity-30">
                <p className="text-[10px] font-black uppercase tracking-[0.6em]">Diagnostic Infrastructure Protocol // Analyzr Engine</p>
            </div>
        </div>
    );
}
