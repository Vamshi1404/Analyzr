import { useState } from 'react';
import { MessageSquare, ChevronRight, BarChart3, FileText } from 'lucide-react';
import type { AnalysisResponse, Insight, ChartMetadata } from '../lib/types';

function InsightCard({ insight }: { insight: Insight }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="card group hover:border-black transition-all">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted px-2 py-0.5 bg-secondary rounded">
                            {insight.layer}
                        </span>
                    </div>
                    <p className="text-sm font-semibold leading-relaxed text-primary">
                        {insight.business_interpretation}
                    </p>
                </div>
                <button 
                    onClick={() => setExpanded(!expanded)}
                    className="text-muted hover:text-primary transition-colors pt-1"
                >
                    <ChevronRight size={18} className={`transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} />
                </button>
            </div>
            {expanded && (
                <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                    <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-2">Statistical Evidence</p>
                    <div className="bg-secondary p-4 rounded-lg font-mono text-[11px] text-secondary overflow-x-auto border border-border">
                        {JSON.stringify(insight.statistical_value, null, 2)}
                    </div>
                    <p className="mt-3 text-[11px] text-muted italic">Metric: {insight.metric_name}</p>
                </div>
            )}
        </div>
    );
}

export default function ResultsPage({ analysis, charts, sessionId, onReset }: {
    analysis: AnalysisResponse;
    charts: ChartMetadata[];
    sessionId: string;
    onReset: () => void;
}) {
    const [downloading, setDownloading] = useState(false);
    const [view, setView] = useState<'all' | 'insights' | 'plots'>('all');

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const url = `/api/report/${sessionId}?format=pdf`;
            window.open(url, '_blank');
        } finally {
            setTimeout(() => setDownloading(false), 2000);
        }
    };

    return (
        <div className="w-full max-w-5xl space-y-24 pb-32 animate-fade-in px-4">
            {/* Report Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b-2 border-black pb-16">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-accent/5 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.4em]">
                        Diagnostic Synthesis
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-black uppercase">Analysis Report.</h1>
                    <p className="text-secondary font-medium flex items-center gap-4">
                        <span className="text-muted uppercase text-[10px] tracking-[0.3em] font-black">Identity</span>
                        <span className="font-mono text-[11px] bg-secondary px-3 py-1 border border-border">{sessionId}</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onReset} className="btn-outline">
                        Reset Session
                    </button>
                    <button 
                        onClick={handleDownload} 
                        disabled={downloading}
                        className="btn-primary"
                    >
                        {downloading ? 'Preparing...' : 'Download Insights'}
                    </button>
                </div>
            </div>

            {/* View Architecture - Rigid Switcher */}
            <div className="flex justify-center">
                <div className="flex items-center gap-0 bg-secondary p-1 border border-border w-fit">
                    {['all', 'insights', 'plots'].map((v) => (
                        <button 
                            key={v}
                            onClick={() => setView(v as any)}
                            className={`px-10 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${view === v ? 'bg-black text-white' : 'text-muted hover:text-black'}`}
                        >
                            {v === 'all' ? 'Master' : v}
                        </button>
                    ))}
                </div>
            </div>

            {/* Intelligence Layers */}
            {(view === 'all') && analysis.datasets.map((ds, idx) => (
                <section key={idx} className="space-y-12 animate-fade-in">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 flex items-center justify-center text-white" style={{ backgroundColor: '#C5A059' }}>
                            <FileText size={20} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase">Executive Summary <span className="text-muted opacity-30 ml-4">({ds.filename})</span></h2>
                    </div>
                    <div className="bg-white border border-border p-12 text-secondary text-2xl font-medium tracking-tight leading-relaxed italic relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                        "{ds.executive_summary}"
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
                        {ds.core_metrics.map((metric, midx) => (
                            <div key={midx} className="p-12 bg-white group/metric hover:bg-secondary transition-all">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted mb-8">{metric.label}</p>
                                <p className="text-6xl font-black text-black mb-6 tracking-tighter group-hover/metric:text-accent transition-colors">{metric.value}</p>
                                <p className="text-[11px] font-bold text-secondary leading-relaxed opacity-50 uppercase tracking-widest">{metric.interpretation}</p>
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            {/* Categorized Inferences */}
            {(view === 'all' || view === 'insights') && (
                <section className="space-y-16 animate-fade-in">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 flex items-center justify-center text-white" style={{ backgroundColor: '#C5A059' }}>
                            <MessageSquare size={20} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase">Intelligence Layers</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
                        {analysis.datasets.flatMap(ds => [
                            ...ds.descriptive,
                            ...ds.diagnostic,
                            ...ds.predictive,
                            ...ds.business
                        ]).map((insight, idx) => (
                            <InsightCard key={idx} insight={insight} />
                        ))}
                    </div>
                </section>
            )}

            {/* Visualization Framework */}
            {(view === 'all' || view === 'plots') && (
                <section className="space-y-16 animate-fade-in">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 flex items-center justify-center text-white" style={{ backgroundColor: '#C5A059' }}>
                            <BarChart3 size={20} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase">Visual Framework</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-12">
                        {charts.map((chart, idx) => (
                            <div key={idx} className="group/chart bg-white border border-border transition-all duration-500 hover:border-accent">
                                <div className="p-12 border-b border-border flex items-center justify-between bg-secondary/30">
                                    <div>
                                        <h3 className="font-black text-3xl tracking-tighter uppercase mb-2">{chart.title}</h3>
                                        <p className="text-[10px] text-accent font-black uppercase tracking-[0.4em]">{chart.plot_type.replace(/_/g, ' ')}</p>
                                    </div>
                                    <div className="w-14 h-14 bg-black flex items-center justify-center text-white shadow-xl transition-all">
                                        <BarChart3 size={24} />
                                    </div>
                                </div>
                                <div className="bg-white p-12 flex justify-center border-b border-border overflow-hidden">
                                    <img 
                                        src={chart.image_url} 
                                        alt={chart.title} 
                                        className="max-w-full h-auto shadow-2xl transition-all duration-1000 group-hover/chart:scale-[1.01]" 
                                    />
                                </div>
                                <div className="p-12 bg-secondary/10">
                                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mb-10">Diagnostic Observations</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
                                        {chart.key_observations.map((obs, oidx) => (
                                            <div key={oidx} className="flex gap-6 p-10 bg-white text-[13px] text-secondary font-medium leading-relaxed hover:bg-secondary transition-colors">
                                                <div className="w-1.5 h-1.5 bg-accent mt-2 shrink-0" />
                                                {obs}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* System Termination */}
            <div className="text-center py-24 border-t-2 border-black mt-24 opacity-30">
                <p className="text-[10px] font-black text-muted uppercase tracking-[1em]">End of Diagnostic synthesis // Analyzr Core</p>
            </div>
        </div>
    );
}
