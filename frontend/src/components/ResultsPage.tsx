import { useState } from 'react';
import { MessageSquare, ChevronRight, BarChart3, FileText, Download, RotateCcw, X, ZoomIn, MessageCircle } from 'lucide-react';
import type { AnalysisResponse, Insight, ChartMetadata } from '../lib/types';
import { Button } from './ui/Button';
import { Tabs, TabsTrigger } from './ui/Tabs';

function InsightCard({ insight }: { insight: Insight }) {
    const [expanded, setExpanded] = useState(false);
    const layerColors: Record<string, { bg: string; text: string; border: string }> = {
        descriptive: { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6', border: '#8b5cf6' },
        diagnostic: { bg: 'rgba(30,41,59,0.1)', text: '#a78bfa', border: '#8b5cf6' },
        predictive: { bg: 'rgba(109,40,217,0.1)', text: '#a78bfa', border: '#6d28d9' },
        business: { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6', border: '#8b5cf6' }
    };
    const color = layerColors[insight.layer] || layerColors.descriptive;

    return (
        <div 
            className="bg-slate-900/35 backdrop-blur-xl rounded-lg border border-slate-800 overflow-hidden hover:border-slate-600 transition-colors cursor-pointer"
            style={{ borderColor: color.border }}
            onClick={() => setExpanded(!expanded)}
        >
            <div className="p-4 md:p-5" style={{ backgroundColor: color.bg }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                        className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider border"
                        style={{ backgroundColor: color.bg, color: color.text, borderColor: color.border }}
                    >
                        {insight.layer}
                    </span>
                    <ChevronRight size={16} style={{ color: color.text }} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
                </div>
                <p className="text-sm font-medium text-slate-100 leading-relaxed">
                    {insight.business_interpretation}
                </p>
            </div>
            {expanded && (
                <div className="border-t border-slate-800 p-4 bg-slate-950/10" style={{ borderColor: color.border }}>
                    <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Statistical Data</p>
                    <pre className="text-xs bg-slate-950/40 backdrop-blur p-3 rounded border border-slate-800 overflow-x-auto text-slate-300">
                        {JSON.stringify(insight.statistical_value, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}

function ZoomModal({ chart, onClose, onAskAI }: { chart: ChartMetadata; onClose: () => void; onAskAI: (chart: ChartMetadata) => void }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-950/90 backdrop-blur-2xl rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-800">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40 backdrop-blur-xl z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-100 mb-1">{chart.title}</h2>
                        <p className="text-sm text-slate-400 uppercase tracking-widest">{chart.plot_type.replace(/_/g, ' ')}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800/60 rounded-lg transition-colors text-slate-300 border border-transparent hover:border-slate-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Chart Image */}
                <div className="p-6 bg-slate-950/20 flex justify-center">
                    <img
                        src={chart.image_url}
                        alt={chart.title}
                        className="max-w-full h-auto rounded-lg border border-slate-800"
                    />
                </div>

                {/* Key Observations */}
                {chart.key_observations.length > 0 && (
                    <div className="p-6 border-t border-slate-800">
                        <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Key Observations</p>
                        <ul className="space-y-3">
                            {chart.key_observations.map((obs, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-slate-300">
                                    <span className="w-2 h-2 bg-purple-400/30 rounded-full flex-shrink-0 mt-2" />
                                    <span>{obs}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="p-6 border-t border-slate-800 bg-slate-950/20 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-slate-700 rounded-lg text-slate-300 font-medium hover:bg-slate-900/40 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => onAskAI(chart)}
                        className="px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-colors bg-purple-600/90 hover:bg-purple-600 border border-purple-500/30"
                    >
                        <MessageCircle size={18} />
                        Ask AI
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ResultsPage({ analysis, charts, sessionId, onReset, onAskAI }: {
    analysis: AnalysisResponse;
    charts: ChartMetadata[];
    sessionId: string;
    onReset: () => void;
    onAskAI: (prompt: string) => void;
}) {
    const [downloading, setDownloading] = useState(false);
    const [view, setView] = useState<'all' | 'insights' | 'plots'>('all');
    const [zoomedChart, setZoomedChart] = useState<ChartMetadata | null>(null);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const { buildReportUrl } = await import('../lib/api');
            const url = buildReportUrl(sessionId, 'pdf');
            window.open(url, '_blank');
        } finally {
            setTimeout(() => setDownloading(false), 2000);
        }
    };

    const buildChartPrompt = (chart: ChartMetadata) => {
        const observations = chart.key_observations?.length
            ? chart.key_observations.map((o) => `- ${o}`).join('\n')
            : '- (no key observations provided)';

        return [
            `You are analyzing a visualization from a data intelligence report.`,
            ``,
            `Chart context:`,
            `Title: ${chart.title}`,
            `Plot type: ${chart.plot_type.replace(/_/g, ' ')}`,
            `Dataset: ${chart.dataset}`,
            `Trend: ${chart.trend_direction}`,
            `Statistical significance: ${chart.statistical_significance}`,
            ``,
            `Key observations:`,
            observations,
            ``,
            `Give me:`,
            `1) A concise plain-language summary`,
            `2) The most important insights`,
            `3) Any anomalies or risks`,
            `4) 2-3 practical next questions I should ask`,
        ].join('\n');
    };

    const handleAskAI = (chart: ChartMetadata) => {
        setZoomedChart(null);
        onAskAI(buildChartPrompt(chart));
    };

    return (
        <div className="w-full min-h-screen pb-24 bg-slate-950">

            {/* Header */}
            <div className="mb-12">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/25 bg-purple-500/10">
                                <span className="text-xs font-semibold text-purple-200 uppercase tracking-widest">✓ Analysis Complete</span>
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-100 mb-2">
                                    Your <span className="text-purple-300">Intelligence Report</span>
                                </h1>
                                <p className="text-sm text-slate-400">
                                    Session ID: <span className="font-mono font-semibold text-slate-300">{sessionId.substring(0, 12)}...</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 flex-col sm:flex-row">
                            <Button
                                onClick={onReset}
                                variant="outline"
                                className="justify-center"
                            >
                                <RotateCcw size={18} />
                                New Analysis
                            </Button>
                            <Button
                                onClick={handleDownload}
                                disabled={downloading}
                                variant="primary"
                                className="justify-center"
                            >
                                <Download size={18} />
                                {downloading ? 'Preparing...' : 'Download PDF'}
                            </Button>
                        </div>
                    </div>

                    {/* View Selector */}
                    <Tabs
                        value={view}
                        onValueChange={(v) => setView(v as 'all' | 'insights' | 'plots')}
                    >
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="insights">Insights</TabsTrigger>
                        <TabsTrigger value="plots">Charts</TabsTrigger>
                    </Tabs>
                </div>
            </div>

            {/* Content Sections */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
                {/* Dataset Summaries */}
                {(view === 'all' || view === 'insights') && (
                    <section className="space-y-8">
                        <div className="space-y-6">
                            {analysis.datasets.map((ds, idx) => (
                                <div key={idx} className="bg-slate-900/35 border border-slate-800 rounded-2xl p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-200">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-100">{ds.filename}</h3>
                                            <p className="text-xs text-slate-400 uppercase tracking-widest">Dataset Summary</p>
                                        </div>
                                    </div>

                                    {/* Executive Summary */}
                                    <div className="mb-8 p-5 rounded-xl border border-slate-800 bg-slate-950/20" style={{ borderLeftColor: '#8b5cf6' }}>
                                        <p className="text-base leading-relaxed text-slate-200">"{ds.executive_summary}"</p>
                                    </div>

                                    {/* Core Metrics */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {ds.core_metrics.map((metric, midx) => (
                                            <div
                                                key={midx}
                                                className="p-5 bg-slate-950/10 border border-slate-800 rounded-xl"
                                            >
                                                <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
                                                    {metric.label}
                                                </p>
                                                <p className="text-3xl font-black text-purple-200 mb-2">{metric.value}</p>
                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                    {metric.interpretation}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Insights Section */}
                {(view === 'all' || view === 'insights') && (
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-200">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-100">Key Insights</h2>
                                <p className="text-sm text-slate-400">AI-Generated Analysis</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {analysis.datasets.flatMap(ds => [
                                ...ds.descriptive,
                                ...ds.diagnostic,
                                ...ds.predictive,
                                ...ds.business
                            ]).map((insight, idx) => (
                                <div key={idx}>
                                    <InsightCard insight={insight} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Visualizations Section - Grid Layout */}
                {(view === 'all' || view === 'plots') && charts.length > 0 && (
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-200">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-100">Charts & Visualizations</h2>
                                <p className="text-sm text-slate-400">{charts.length} Insights</p>
                            </div>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {charts.map((chart, idx) => (
                                <div
                                    key={idx}
                                    className="bg-slate-900/35 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-colors cursor-pointer flex flex-col h-full"
                                >
                                    {/* Card Header */}
                                    <div className="p-4 border-b border-slate-800 bg-slate-950/10">
                                        <h3 className="text-base font-bold text-slate-100 mb-1 truncate">{chart.title}</h3>
                                        <p className="text-xs text-cyan-300 font-semibold uppercase tracking-wider">
                                            {chart.plot_type.replace(/_/g, ' ')}
                                        </p>
                                    </div>

                                    {/* Chart Image */}
                                    <div className="relative flex-1 p-4 bg-slate-950/10 overflow-hidden flex items-center justify-center min-h-64">
                                        <img
                                            src={chart.image_url}
                                            alt={chart.title}
                                            className="max-w-full h-auto max-h-64 object-contain"
                                        />
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="p-4 border-t border-slate-800 bg-slate-950/10 flex gap-2">
                                        <Button
                                            onClick={() => setZoomedChart(chart)}
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 justify-center"
                                        >
                                            <ZoomIn size={16} />
                                            Zoom
                                        </Button>
                                        <Button
                                            onClick={() => handleAskAI(chart)}
                                            variant="primary"
                                            size="sm"
                                            className="flex-1 justify-center"
                                        >
                                            <MessageCircle size={16} />
                                            Ask AI
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>

            {/* Zoom Modal */}
            {zoomedChart && (
                <ZoomModal
                    chart={zoomedChart}
                    onClose={() => setZoomedChart(null)}
                    onAskAI={handleAskAI}
                />
            )}
        </div>
    );
}
