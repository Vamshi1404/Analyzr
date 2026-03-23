import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-center font-bold text-lg text-slate-50">
              A
            </div>
            <div>
              <h1 className="text-lg font-bold font-display tracking-tight">Analyzr</h1>
              <p className="text-xs text-slate-400 font-medium">Data Intelligence</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <Sparkles size={14} />
            Powered by AI Intelligence Engine
          </div>
        </div>
      </header>

      <main className="relative">{children}</main>

      {/* Keep footer minimal; pages handle their own spacing */}
      {location.pathname !== '/' && (
        <footer className="border-t border-slate-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles size={14} />
              Powered by AI Intelligence Engine
            </div>
            <p className="text-xs text-slate-400">© 2024 Analyzr. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
