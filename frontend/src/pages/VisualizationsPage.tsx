import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Image, TrendingUp, Info, Upload } from 'lucide-react';
import { fetchVisualizations } from '../lib/api';
import { loadSession } from '../lib/sessionStore';
import type { ChartMetadata } from '../lib/types';

const TREND_COLOR: Record<string, string> = {
    up: '#10b981', down: '#f43f5e', flat: '#6366f1', mixed: '#f59e0b', 'N/A': '#6060a0',
};

const PLOT_LABELS: Record<string, string> = {
    histogram: 'Histogram',
    box_plot: 'Box Plot',
    correlation_heatmap: 'Heatmap',
    bar_chart: 'Bar Chart',
    line_chart: 'Line Chart',
    scatter_plot: 'Scatter Plot',
};

function ChartCard({ chart }: { chart: ChartMetadata }) {
    const [showMeta, setShowMeta] = useState(false);

    return (
        <div className="glass" style={{ overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(99,102,241,0.15)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}>
            {/* Chart image */}
            <div style={{ background: 'rgba(0,0,0,0.3)', position: 'relative' }}>
                <img src={chart.image_url} alt={chart.title}
                    style={{ width: '100%', display: 'block', maxHeight: 280, objectFit: 'contain' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'; }}
                />
            </div>

            {/* Info */}
            <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{chart.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{chart.dataset}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '2px 8px', borderRadius: 4 }}>
                            {PLOT_LABELS[chart.plot_type] ?? chart.plot_type}
                        </span>
                        {chart.trend_direction !== 'N/A' && (
                            <span style={{ fontSize: 11, color: TREND_COLOR[chart.trend_direction] ?? '#aaa' }}>
                                <TrendingUp size={12} style={{ display: 'inline' }} /> {chart.trend_direction}
                            </span>
                        )}
                    </div>
                </div>

                {/* Toggle observations */}
                <button onClick={() => setShowMeta(!showMeta)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--indigo-light)', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                    <Info size={12} /> {showMeta ? 'Hide' : 'Show'} metadata
                </button>

                {showMeta && (
                    <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                            X: {chart.x_axis} · Y: {chart.y_axis} · Significance: {chart.statistical_significance}
                        </div>
                        {chart.key_observations.map((obs, i) => (
                            <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 8, borderLeft: '2px solid var(--indigo)', marginBottom: 3 }}>{obs}</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VisualizationsPage() {
    const navigate = useNavigate();
    const sessionId = loadSession();
    const [filterType, setFilterType] = useState('all');

    const { data, isLoading, isError } = useQuery({
        queryKey: ['visualizations', sessionId],
        queryFn: () => fetchVisualizations(sessionId!),
        enabled: !!sessionId,
    });

    if (!sessionId) return (
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <Upload size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>No datasets uploaded yet.</p>
            <button className="btn-glow" style={{ padding: '10px 24px' }} onClick={() => navigate('/')}>Upload CSV Files</button>
        </div>
    );

    if (isLoading) return <div style={{ textAlign: 'center', paddingTop: 80, color: 'var(--text-secondary)' }}>Loading charts…</div>;
    if (isError || !data) return <div style={{ textAlign: 'center', paddingTop: 80, color: 'var(--rose)' }}>Failed to load charts.</div>;

    const types = ['all', ...Array.from(new Set(data.charts.map((c) => c.plot_type)))];
    const filtered = filterType === 'all' ? data.charts : data.charts.filter((c) => c.plot_type === filterType);

    return (
        <div className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Visualization <span className="gradient-text">Gallery</span></h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{data.charts.length} charts generated</p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {types.map((t) => (
                        <button key={t} onClick={() => setFilterType(t)}
                            style={{
                                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
                                background: filterType === t ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                                color: filterType === t ? '#818cf8' : 'var(--text-muted)', transition: 'all 0.15s'
                            }}>
                            {PLOT_LABELS[t] ?? t}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: 40 }}>
                    <Image size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No charts for this filter.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
                    {filtered.map((chart) => <ChartCard key={chart.chart_id} chart={chart} />)}
                </div>
            )}
        </div>
    );
}
