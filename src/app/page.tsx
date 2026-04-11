export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden relative">
      {/* Decorative Neon Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />

      <div className="z-10 text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="inline-block px-4 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-bold tracking-widest uppercase mb-4">
          Project SCPD v2
        </div>
        
        <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-white drop-shadow-2xl">
          SIN <span className="text-red-600 neon-text-red">CITY</span>
        </h1>
        
        <p className="text-gray-400 max-w-md mx-auto font-light tracking-wide text-sm leading-relaxed">
          Smart City Planning & Development for the high-stakes neon sprawl. 
          Real-time GIS integration for the urban underground.
        </p>

        <div className="pt-10">
          <button className="group relative px-8 py-3 overflow-hidden rounded-sm bg-red-600 font-bold text-white transition-all hover:bg-red-700">
            <span className="relative z-10 uppercase tracking-widest text-sm">Enter Gateway</span>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 left-10 text-[10px] text-gray-700 font-mono tracking-widest uppercase">
        Coordinate: 36.1716° N, 115.1391° W
      </div>
      
      <div className="absolute bottom-10 right-10 text-[10px] text-gray-500 font-mono tracking-widest uppercase">
        © 2026 SCPD Analytics
      </div>
    </main>
  );
}
