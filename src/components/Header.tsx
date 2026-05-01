import { Link, useLocation } from 'react-router-dom';
import { Zap, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onOpenAuth: () => void;
}

export function Header({ onOpenAuth }: HeaderProps) {
  const location = useLocation();
  const { user, loading, signOut } = useAuth();

  const linkClass = (path: string) =>
    `transition-colors ${location.pathname === path ? 'text-fab-cyan' : 'text-white/50 hover:text-white'}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-fab-navy/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-fab-cyan/20 border border-fab-cyan/40 flex items-center justify-center">
            <Zap className="w-4 h-4 text-fab-cyan" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Fab3D<span className="text-fab-cyan">.io</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/" className={linkClass('/')}>Home</Link>
          <Link to="/text-to-cad" className={linkClass('/text-to-cad')}>Text-to-CAD</Link>
          <Link to="/pricing" className={linkClass('/pricing')}>Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-20 h-8 bg-white/5 rounded-md animate-pulse" />
          ) : user ? (
            <>
              <span className="text-sm text-white/60 truncate max-w-[160px]">{user.email}</span>
              <button
                onClick={signOut}
                className="text-sm text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5 flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onOpenAuth}
                className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5"
              >
                Sign in
              </button>
              <button
                onClick={onOpenAuth}
                className="text-sm bg-fab-cyan/10 border border-fab-cyan/30 text-fab-cyan hover:bg-fab-cyan/20 transition-all px-4 py-1.5 rounded-md font-medium"
              >
                Get started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
