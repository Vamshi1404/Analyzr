import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BarChart2, TrendingUp, Brain, Briefcase, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { runAnalysis } from '../lib/api';
import { loadSession } from '../lib/sessionStore';
import type { Insight, DatasetAnalysis } from '../lib/types';

const LAYER_META = {
    descriptive: { icon: BarChart2, color: '#6366f1', label: 'Descriptive' },
    diagnostic: { icon: TrendingUp, color: '#06b6d4', label: 'Diagnostic' },
    predictive: { icon: Brain, color: '#8b5cf6', label: 'Predictive' },
    business: { icon: Briefcase, color: '#f59e0b', label: 'Business Intelligence' },
};

function ConfidenceBar({ value }: { value: number }) {
    return (
        <div className="confidence-bar-track" style={{ width: 80 }}>
            <div className="confidence-bar-fill" style={{ width: `${value * 100}%` }} />
        </div>
    );
}

function InsightCard({ insight }: { insight: Insight }) {
    const [expanded, setExpanded] = useState(false);
    const layer = LAYER_META[insight.layer] || LAYER_META.descriptive;
    const Icon = layer.icon;

    return (
        <div className="glass" style={{ padding: 16, marginBottom: 10, transition: 'background 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ background: `${layer.color}22`, borderRadius: 8, padding: 8, flexShrink: 0 }}>
                    <Icon size={16} color={layer.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: 'var(--text-primary)' }}>
                        {insight.metric_name}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>
                        {insight.business_interpretation}
                    </div>
                    {expanded && (
                        <pre className="mono" style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: 6, overflow: 'auto' }}>
                            {JSON.stringify(insight.statistical_value, null, 2)}
                        </pre>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: layer.color, fontWeight: 600 }}>{layer.label}</span>
                    <ConfidenceBar value={insight.confidence_score} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(insight.confidence_score * 100).toFixed(0)}%</span>
                    <button onClick={() => setExpanded(!expanded)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DatasetSection({ da }: { da: DatasetAnalysis }) {
    const [tab, setTab] = useState<'descriptive' | 'diagnostic' | 'predictive' | 'business'>('descriptive');
    const layers = ['descriptive', 'diagnostic', 'predictive', 'business'] as const;

    return (
        <div className="glass" style={{ padding: 24, marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{da.filename}</h2>

            {/* Executive Summary */}
            {da.executive_summary && (
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{da.executive_summary}</p>
                </div>
            )}

            {/* Recommendations */}
            {da.recommendations?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--cyan)', marginBottom: 8 }}>Recommendations</div>
                    {da.recommendations.map((r, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                            <span style={{ color: 'var(--cyan)', flexShrink: 0 }}>→</span>
                            {r}
                        </div>
                    ))}
                </div>
            )}

            {/* Layer tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {layers.map((l) => {
                    const meta = LAYER_META[l];
                    return (
                        <button key={l} onClick={() => setTab(l)}
                            style={{
                                padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
                                background: tab === l ? `${meta.color}22` : 'rgba(255,255,255,0.04)',
                                color: tab === l ? meta.color : 'var(--text-muted)',
                                transition: 'all 0.15s',
                            }}>
                            {meta.label} ({da[l].length})
                        </button>
                    );
                })}
            </div>

            {/* Insights */}
            <div>
                {da[tab].length === 0
                    ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No insights in this layer.</p>
                    : da[tab].map((ins, i) => <InsightCard key={i} insight={ins} />)
                }
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const sessionId = loadSession();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['analysis', sessionId],
        queryFn: () => runAnalysis(sessionId!),
        enabled: !!sessionId,
    });

    if (!sessionId) return (
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <Upload size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>No datasets uploaded yet.</p>
            <button className="btn-glow" style={{ padding: '10px 24px' }} onClick={() => navigate('/')}>Upload CSV Files</button>
        </div>
    );

    if (isLoading) return (
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <div className="pulse-loader" style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#06b6d4)', margin: '0 auto 24px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Running analysis pipeline…</p>
        </div>
    );

    if (isError || !data) return (
        <div style={{ textAlign: 'center', paddingTop: 80, color: 'var(--rose)' }}>
            Failed to load analysis. Check that the backend is running.
        </div>
    );

    return (
        <div className="fade-up">
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Analysis <span className="gradient-text">Dashboard</span></h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{data.datasets.length} dataset(s) · Session: <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sessionId?.slice(0, 12)}…</span></p>
            </div>

            {data.cross_dataset_insights?.length > 0 && (
                <div className="glass" style={{ padding: '16px 20px', marginBottom: 32, borderColor: 'rgba(6,182,212,0.3)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--cyan)', marginBottom: 8, fontSize: 14 }}>Cross-Dataset Insights</div>
                    {data.cross_dataset_insights.map((ins, i) => (
                        <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>• {ins}</div>
                    ))}
                </div>
            )}

            {data.datasets.map((da) => <DatasetSection key={da.filename} da={da} />)}
        </div>
    );
}
