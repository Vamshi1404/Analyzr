import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDown, FileText, Code, BookOpen, Upload, Loader2 } from 'lucide-react';
import { buildReportUrl } from '../lib/api';
import { loadSession } from '../lib/sessionStore';

type Format = 'pdf' | 'docx' | 'json';
type ReportType = 'executive' | 'technical' | 'audit';

const FORMATS: { id: Format; icon: typeof FileDown; label: string; desc: string }[] = [
    { id: 'pdf', icon: FileDown, label: 'PDF', desc: 'Formatted report with charts and tables' },
    { id: 'docx', icon: FileText, label: 'DOCX', desc: 'Editable Word document with styling' },
    { id: 'json', icon: Code, label: 'JSON', desc: 'Structured machine-readable data export' },
];

const REPORT_TYPES: { id: ReportType; label: string; desc: string }[] = [
    { id: 'executive', label: 'Executive Summary', desc: 'High-level insights for leadership' },
    { id: 'technical', label: 'Technical Report', desc: 'Detailed stats + insight tables' },
    { id: 'audit', label: 'Full Audit', desc: 'Complete analysis with all raw evidence' },
];

export default function ReportPage() {
    const navigate = useNavigate();
    const sessionId = loadSession();
    const [format, setFormat] = useState<Format>('pdf');
    const [reportType, setReportType] = useState<ReportType>('executive');
    const [downloading, setDownloading] = useState(false);

    if (!sessionId) return (
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <Upload size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>No datasets uploaded yet.</p>
            <button className="btn-glow" style={{ padding: '10px 24px' }} onClick={() => navigate('/')}>Upload CSV Files</button>
        </div>
    );

    async function handleDownload() {
        setDownloading(true);
        try {
            const url = buildReportUrl(sessionId!, format, reportType);
            const res = await fetch(url);
            if (!res.ok) throw new Error(await res.text());
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `analyzr_report_${reportType}.${format}`;
            a.click();
        } catch (e) {
            alert(`Download failed: ${e}`);
        } finally {
            setDownloading(false);
        }
    }

    return (
        <div className="fade-up" style={{ maxWidth: 660, margin: '0 auto' }}>
            <div style={{ marginBottom: 36 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Export <span className="gradient-text">Report</span></h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Download a professional report of your analysis.</p>
            </div>

            {/* Report Type */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, color: 'var(--text-secondary)' }}>
                    <BookOpen size={14} style={{ display: 'inline', marginRight: 6 }} />Report Type
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                    {REPORT_TYPES.map((rt) => (
                        <label key={rt.id} style={{
                            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
                            border: `1px solid ${reportType === rt.id ? 'var(--indigo)' : 'var(--border)'}`,
                            background: reportType === rt.id ? 'rgba(99,102,241,0.08)' : 'var(--bg-card)',
                            transition: 'all 0.15s'
                        }}>
                            <input type="radio" name="report_type" value={rt.id} checked={reportType === rt.id}
                                onChange={() => setReportType(rt.id)} style={{ accentColor: '#6366f1', width: 16, height: 16 }} />
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{rt.label}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{rt.desc}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Format */}
            <div style={{ marginBottom: 36 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, color: 'var(--text-secondary)' }}>
                    <FileDown size={14} style={{ display: 'inline', marginRight: 6 }} />File Format
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    {FORMATS.map(({ id, icon: Icon, label, desc }) => (
                        <button key={id} onClick={() => setFormat(id)}
                            style={{
                                flex: 1, padding: '16px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                                border: `1px solid ${format === id ? 'var(--indigo)' : 'var(--border)'}`,
                                background: format === id ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)',
                                transition: 'all 0.15s'
                            }}>
                            <Icon size={22} color={format === id ? '#818cf8' : 'var(--text-muted)'} style={{ margin: '0 auto 8px' }} />
                            <div style={{ fontWeight: 700, fontSize: 14, color: format === id ? '#818cf8' : 'var(--text-primary)' }}>{label}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Download Button */}
            <button onClick={handleDownload} disabled={downloading} className="btn-glow"
                style={{ width: '100%', padding: 15, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {downloading
                    ? <><Loader2 size={18} className="pulse-loader" /> Generating…</>
                    : <><FileDown size={18} /> Download {format.toUpperCase()} Report</>
                }
            </button>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 16 }}>
                Report includes: ranked insights · confidence scores · AI explanations · dataset metadata
            </p>
        </div>
    );
}
