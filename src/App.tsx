import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SignUpModal } from '@/components/SignUpModal';
import { Landing } from '@/pages/Landing';
import { TextToCAD } from '@/pages/TextToCAD';
import { Pricing } from '@/pages/Pricing';

function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Fab3D<span className="text-fab-cyan">.io</span></span>
          <span className="text-white/20 text-xs">— AI-Native 3D Printing Tools</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-white/30">
          <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
          <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
          <span>© 2026 Fab3D LLC</span>
        </div>
      </div>
    </footer>
  );
}

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-fab-navy text-white">
        <Header onOpenAuth={() => setAuthModalOpen(true)} />
        <SignUpModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/text-to-cad" element={<TextToCAD />} />
            <Route path="/pricing" element={<Pricing />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
