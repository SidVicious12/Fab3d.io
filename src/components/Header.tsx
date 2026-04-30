import { Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-fab-navy/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-fab-cyan/20 border border-fab-cyan/40 flex items-center justify-center">
            <Zap className="w-4 h-4 text-fab-cyan" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Fab3D<span className="text-fab-cyan">.io</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-white/50">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#generator" className="hover:text-fab-cyan text-fab-cyan transition-colors">Text-to-CAD</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5">
            Sign in
          </button>
          <button className="text-sm bg-fab-cyan/10 border border-fab-cyan/30 text-fab-cyan hover:bg-fab-cyan/20 transition-all px-4 py-1.5 rounded-md font-medium">
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}
