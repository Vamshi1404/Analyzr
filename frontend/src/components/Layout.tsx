// No sidebar items needed

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-outfit">
      {/* Ultra Minimal Header - Logo & Name Only */}
      <header className="h-24 flex items-center justify-center px-8 md:px-16 sticky top-0 z-50">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-10 h-10 flex items-center justify-center transition-all group-hover:scale-110" style={{ backgroundColor: '#C5A059' }}>
            <span className="text-white font-black text-xs">A</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter leading-none text-black uppercase">Analyzr</h1>
        </div>
      </header>

      {/* Main Content Area - Perfectly Centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 md:px-16 animate-fade-in w-full pb-24">
        {children}
      </main>
    </div>
  );
}
