import { useState, useCallback } from 'react';
import { Upload, FileText, X, Play, ArrowRight } from 'lucide-react';
import { uploadFiles, runAnalysis } from '../lib/api';
import { saveSession } from '../lib/sessionStore';
import type { AnalysisResponse } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface Props {
    onPhaseChange: (sessionId: string, phase: 'uploading' | 'analyzing') => void;
    onComplete: (sessionId: string, analysis: AnalysisResponse) => void;
}

export default function UploadPage({ onPhaseChange, onComplete }: Props) {
    const [files, setFiles] = useState<File[]>([]);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const addFiles = useCallback((fl: FileList | null) => {
        if (!fl) return;
        const csvs = Array.from(fl).filter(f => f.name.endsWith('.csv'));
        setFiles(prev => {
            const names = new Set(prev.map(f => f.name));
            return [...prev, ...csvs.filter(f => !names.has(f.name))];
        });
    }, []);

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleExecute = async () => {
        if (!files.length || loading) return;
        setError(null);
        setLoading(true);
        try {
            const upload = await uploadFiles(files);
            saveSession(upload.session_id);
            onPhaseChange(upload.session_id, 'uploading');
            onPhaseChange(upload.session_id, 'analyzing');
            const result = await runAnalysis(upload.session_id);
            onComplete(upload.session_id, result);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-14">
            <div className="w-full max-w-3xl text-center space-y-3 mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-100 leading-tight">
                    Autonomous Analytics from CSVs
                </h1>
                <p className="text-sm md:text-base text-slate-400">
                    Upload your datasets to get AI-powered intelligence with charts and actionable insights.
                </p>
            </div>

            <Card className="w-full max-w-3xl rounded-3xl" tone="default">
                {/* Upload Area */}
                <div
                    className="p-8 md:p-10 transition-colors cursor-pointer"
                    style={{
                        backgroundColor: dragging ? 'rgba(139, 92, 246, 0.08)' : 'transparent'
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        addFiles(e.dataTransfer.files);
                    }}
                    onClick={() => document.getElementById('file-input')?.click()}
                >
                    <input
                        id="file-input"
                        type="file"
                        multiple
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => addFiles(e.target.files)}
                    />

                    <div className="flex justify-center mb-6">
                        <div
                            className="w-20 h-20 rounded-2xl border flex items-center justify-center"
                            style={{
                                backgroundColor: dragging ? 'rgba(139, 92, 246, 0.16)' : 'rgba(2, 6, 23, 0.2)',
                                borderColor: dragging ? 'rgba(139, 92, 246, 0.45)' : 'rgba(71, 85, 105, 0.6)'
                            }}
                        >
                            <Upload
                                size={40}
                                style={{
                                    color: dragging ? '#c4b5fd' : '#8b5cf6'
                                }}
                            />
                        </div>
                    </div>

                    <div className="text-center space-y-3">
                        <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-100">
                            {files.length > 0 ? (
                                <span>
                                    <span className="text-purple-300">{files.length}</span>{' '}
                                    {files.length === 1 ? 'file' : 'files'} ready
                                </span>
                            ) : (
                                <span>
                                    Upload Your <span className="text-purple-300">Data</span>
                                </span>
                            )}
                        </h3>
                        <p className="text-sm text-slate-400">
                            {dragging ? 'Release to upload' : 'CSV files • Drag and drop or click to browse'}
                        </p>
                    </div>
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div className="border-t border-slate-800 divide-y divide-slate-800 bg-slate-950/10">
                        <div className="px-6 py-4 flex items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Uploaded Files
                            </span>
                        </div>
                        {files.map((file, i) => (
                            <div
                                key={i}
                                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-950/30 flex items-center justify-center"
                                        style={{
                                            backgroundColor: 'rgba(139, 92, 246, 0.08)',
                                            borderColor: 'rgba(139, 92, 246, 0.28)'
                                        }}
                                    >
                                        <FileText size={18} style={{ color: '#a78bfa' }} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-100 truncate">{file.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(i);
                                    }}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500/15 border border-transparent hover:border-red-500/20 transition-colors"
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="border-t border-slate-800 bg-red-500/10 px-6 py-5">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: '#ef4444' }} />
                            <p className="text-sm text-red-200">{error}</p>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <div className="border-t border-slate-800 p-6">
                    <Button
                        onClick={handleExecute}
                        disabled={!files.length || loading}
                        className="w-full rounded-2xl"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div
                                    style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: '50%',
                                        border: '2px solid rgba(255, 255, 255, 0.35)',
                                        borderTopColor: 'white',
                                        animation: 'rotate-slow 1s linear infinite'
                                    }}
                                />
                                <span>Analyzing</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <Play size={18} fill="currentColor" />
                                <span>Begin Analysis</span>
                                <ArrowRight size={16} />
                            </div>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}

