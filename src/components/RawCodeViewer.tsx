import { useState } from 'react';
import { ChevronDown, ChevronUp, Code2 } from 'lucide-react';

interface RawCodeViewerProps {
  scadCode: string | null;
}

export function RawCodeViewer({ scadCode }: RawCodeViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!scadCode) return null;

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/3 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-fab-cyan" />
          <span className="text-sm text-white/70 font-medium">OpenSCAD Source</span>
          <span className="text-xs text-white/30">({scadCode.split('\n').length} lines)</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-white/40" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/40" />
        )}
      </button>

      {isOpen && (
        <div className="bg-black/30 border-t border-white/5">
          <pre className="p-4 text-xs font-mono text-green-400/80 overflow-x-auto max-h-64 overflow-y-auto leading-relaxed">
            <code>{scadCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
