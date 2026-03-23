import { FileText, Download, MoreVertical, Eye, Database } from 'lucide-react';

export default function ReportsView() {
  const RECENT_DOCS = [
    { id: 1, name: 'Q3 Market Expansion Analysis.pdf',    size: '4.2 MB',  date: 'Oct 24, 2023 • 12:40 PM', type: 'EXECUTIVE', ext: 'pdf' },
    { id: 2, name: 'Raw_Intelligence_Stream_099.csv',     size: '128 KB',  date: 'Oct 23, 2023 • 09:15 AM', type: 'TECHNICAL',  ext: 'csv' },
    { id: 3, name: 'Stakeholder_Presentation_Draft_V4.pdf', size: '11.5 MB', date: 'Oct 21, 2023 • 05:30 PM', type: 'EXECUTIVE', ext: 'pdf' },
    { id: 4, name: 'Consumer_Sentiment_Audit_Log.csv',   size: '842 KB',  date: 'Oct 20, 2023 • 11:22 AM', type: 'TECHNICAL',  ext: 'csv' },
  ];

  return (
    <div className="w-full">

      {/* ── Hero Header ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 animate-slide-up">
        <div className="max-w-xl">
          <h1 className="text-5xl font-black text-[#1c1917] tracking-tight leading-tight mb-4">
            Intelligence <span className="text-[#8c6b29]">Reports</span>
          </h1>
          <p className="text-[15px] leading-relaxed text-[#57534e]">
            Curated executive summaries and data exports derived from your CSV
            frameworks. High-fidelity architectural analysis ready for distribution.
          </p>
        </div>

        <div className="flex items-center gap-12 shrink-0">
          <div className="flex flex-col items-end pr-12 border-r border-[#d6d3d1]">
            <span className="text-5xl font-black text-[#1c1917] tracking-tighter leading-none">124</span>
            <span className="mt-2 text-[11px] font-bold text-[#57534e] tracking-widest uppercase">Total Exports</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-5xl font-black text-[#a17c2f] tracking-tighter leading-none">12</span>
            <span className="mt-2 text-[11px] font-bold text-[#57534e] tracking-widest uppercase">Active Schedules</span>
          </div>
        </div>
      </div>

      {/* ── Action Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-slide-up animate-slide-up-1">

        {/* Automate */}
        <div className="card-white p-8 flex flex-col justify-between group cursor-pointer">
          <div>
            <h3 className="text-[18px] font-bold text-[#1c1917] mb-3">Automate Insights</h3>
            <p className="text-[14px] text-[#57534e] leading-relaxed mb-8">
              Configure recurring exports to email or cloud storage providers.
            </p>
          </div>
          <button className="text-[11px] font-bold text-[#8c6b29] tracking-[0.12em] uppercase flex items-center gap-2 group-hover:text-[#735520] transition-colors self-start">
            Create New Schedule <span className="text-base">→</span>
          </button>
        </div>

        {/* One-Time */}
        <div className="card-gray flex flex-col justify-between" style={{ padding: '28px' }}>
          <div>
            <h3 className="text-[18px] font-bold text-[#1c1917] mb-3">One-Time Export</h3>
            <p className="text-[14px] text-[#57534e] leading-relaxed mb-8">
              Instantly generate a full repository audit in CSV or PDF format.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="btn-dark">PDF Audit</button>
            <button className="btn-muted">Raw CSV</button>
          </div>
        </div>

        {/* Model Training */}
        <div className="card-accent flex flex-col justify-between group cursor-pointer">
          <div>
            <h3 className="text-[18px] font-bold text-white mb-3">Model Training Report</h3>
            <p className="text-[14px] text-white/80 leading-relaxed mb-8">
              Download the latest technical validation from the AI processing engine.
            </p>
          </div>
          <button className="text-[11px] font-bold text-white tracking-[0.12em] uppercase flex items-center gap-2 hover:opacity-80 transition-opacity self-start">
            <Download size={14} strokeWidth={2.5} /> Fetch Latest
          </button>
        </div>
      </div>

      {/* ── Document Library ─────────────────────────────── */}
      <div className="animate-slide-up animate-slide-up-2">
        <div className="flex items-center justify-between pb-4 mb-1 border-b-2 border-[#1c1917]">
          <h2 className="text-[19px] font-extrabold text-[#1c1917] tracking-tight">Recent Document Library</h2>
          <div className="flex gap-8 text-[11px] font-bold text-[#57534e] tracking-[0.1em] uppercase">
            <button className="flex items-center gap-2 hover:text-[#1c1917] transition-colors cursor-pointer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
              Filter by Type
            </button>
            <button className="flex items-center gap-2 hover:text-[#1c1917] transition-colors cursor-pointer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 7l3 3 4-4"/><path d="M3 17l3 3 4-4"/><path d="M14 4h7M14 12h7M14 20h7"/></svg>
              Date Desc
            </button>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-[#f0efee]">
          {RECENT_DOCS.map((doc) => (
            <div
              key={doc.id}
              className="py-5 flex items-center justify-between -mx-4 px-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-[#f5f5f4] group"
            >
              {/* Left side */}
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-[#e7e5e4] group-hover:bg-white border border-transparent group-hover:border-[#d6d3d1] flex flex-col items-center justify-center transition-all duration-200 shadow-[0_0_0_0_rgba(0,0,0,0)] group-hover:shadow-md">
                  {doc.ext === 'pdf'
                    ? <FileText size={18} strokeWidth={2.5} className="text-[#57534e]" />
                    : <Database size={18} strokeWidth={2.5} className="text-[#57534e]" />}
                  <span className="text-[8px] font-black text-[#a8a29e] mt-0.5 uppercase">{doc.ext}</span>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#1c1917] mb-0.5 group-hover:text-[#a17c2f] transition-colors">{doc.name}</h4>
                  <p className="text-[12px] text-[#a8a29e]">Size: {doc.size} &bull; Generated: {doc.date}</p>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-8">
                <span className={`px-3.5 py-1.5 text-[9px] font-black tracking-[0.15em] uppercase rounded-full ${
                  doc.type === 'EXECUTIVE'
                    ? 'bg-[#a17c2f] text-white shadow-sm'
                    : 'bg-[#e7e5e4] text-[#57534e]'
                }`}>
                  {doc.type}
                </span>
                <div className="flex items-center gap-4 text-[#c7c3bf] group-hover:text-[#a8a29e] transition-colors">
                  <button className="hover:text-[#1c1917] transition-colors"><Eye size={17} /></button>
                  <button className="hover:text-[#1c1917] transition-colors"><Download size={17} /></button>
                  <button className="hover:text-[#1c1917] transition-colors"><MoreVertical size={17} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
