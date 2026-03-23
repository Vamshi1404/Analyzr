import { useState, useCallback } from 'react';
import { Upload, FileText, X, Play } from 'lucide-react';
import { uploadFiles, runAnalysis } from '../lib/api';
import { saveSession } from '../lib/sessionStore';
import type { AnalysisResponse } from '../lib/types';

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
            // Only transition AFTER session is established
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
        <div className="w-full max-w-4xl flex flex-col items-center justify-center space-y-24">
            {/* Hero Section - Super Minimal */}
            <div className="text-center space-y-8 animate-fade-in">
                <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-none text-black uppercase">
                    Analyzr.
                </h1>
                <div className="flex items-center justify-center gap-6">
                    <div className="h-px w-12 bg-accent opacity-30" />
                    <p className="text-[10px] text-secondary font-black uppercase tracking-[0.5em] opacity-40">
                        Autonomous CSV Intelligence
                    </p>
                    <div className="h-px w-12 bg-accent opacity-30" />
                </div>
            </div>

            {/* Upload Card - The focus */}
            <div className="card group relative w-full max-w-2xl bg-white border-2 border-black p-1">
                <div className="border border-accent/20 p-20 relative overflow-hidden group/inner">
                    {/* Background Glow */}
                    <div className="absolute -inset-20 bg-gradient-to-tr from-accent/10 to-transparent blur-3xl opacity-0 group-hover/inner:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                    <div className={`
                        relative z-10 flex flex-col items-center justify-center text-center cursor-pointer py-10
                        ${dragging ? 'scale-[0.98]' : 'hover:scale-[1.01]'}
                        transition-transform duration-500
                    `}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                    onClick={() => document.getElementById('file-input')?.click()}>
                        
                        <input
                            id="file-input"
                            type="file"
                            multiple
                            accept=".csv"
                            className="hidden"
                            onChange={e => addFiles(e.target.files)}
                        />

                        <div className="w-20 h-20 flex items-center justify-center mb-10 border-2 border-black bg-white group-hover/inner:bg-accent group-hover/inner:text-white group-hover/inner:border-accent transition-all duration-500">
                            <Upload size={28} />
                        </div>
                        <h3 className="text-4xl font-black tracking-tighter mb-4 uppercase">Ingest Assets</h3>
                        <p className="text-[10px] text-secondary font-black mb-12 max-w-xs opacity-40 uppercase tracking-[0.4em] leading-relaxed">
                            Secure Multi-Dataset Orchestration Framework.
                        </p>
                        <button className="btn-outline">
                            Select Files
                        </button>
                    </div>
                </div>

                {/* Staged Files - Integrated into card */}
                {files.length > 0 && (
                    <div className="mt-1 animate-fade-in w-full bg-black">
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-8 bg-white border-t border-black group/file hover:bg-secondary transition-all">
                                <div className="flex items-center gap-8">
                                    <div className="w-10 h-10 bg-accent text-white flex items-center justify-center border border-accent shadow-lg shadow-accent/20">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-black truncate max-w-[250px] uppercase tracking-tighter">{file.name}</p>
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Status & Action - Integrated with absolute positioning fix */}
                <div className="mt-1 relative z-20">
                    {error && (
                        <div className="p-8 bg-black text-white border-t border-accent text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-6 animate-fade-in">
                             <div className="w-2 h-2 bg-accent animate-pulse" />
                             {error}
                        </div>
                    )}

                    <button 
                        onClick={(e) => { e.stopPropagation(); handleExecute(); }}
                        disabled={!files.length || loading}
                        className="w-full btn-primary py-10"
                    >
                        {loading ? (
                            <div className="flex items-center gap-6">
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white animate-spin" />
                                Synthesizing...
                            </div>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Play size={20} fill="currentColor" />
                                Initialize Comprehensive Analysis
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
