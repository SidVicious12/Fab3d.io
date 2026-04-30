import { X, Zap, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-fab-navy-mid border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-black/50 animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-fab-cyan/10 border border-fab-cyan/20 mb-6 mx-auto">
          <Zap className="w-7 h-7 text-fab-cyan" />
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          You've used all free generations
        </h2>
        <p className="text-white/50 text-center text-sm mb-8">
          Sign up free to get 10 generations per day — double your limit instantly.
        </p>

        <div className="space-y-3 mb-8">
          {[
            { icon: Infinity, text: '10 free generations per day' },
            { icon: Zap, text: 'Faster generation queue' },
            { icon: Zap, text: 'Save your model history' },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-white/70">
              <div className="w-5 h-5 rounded-full bg-fab-cyan/10 border border-fab-cyan/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3 h-3 text-fab-cyan" />
              </div>
              {text}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Button size="lg" className="w-full">
            Sign up free →
          </Button>
          <button
            onClick={onClose}
            className="w-full text-sm text-white/30 hover:text-white/60 transition-colors py-2"
          >
            Maybe later
          </button>
        </div>

        <p className="text-center text-xs text-white/20 mt-4">
          No credit card required · Free forever
        </p>
      </div>
    </div>
  );
}
