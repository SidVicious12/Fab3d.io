import { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModelViewer } from '@/components/ModelViewer';
import { ExportButtons } from '@/components/ExportButtons';
import { RawCodeViewer } from '@/components/RawCodeViewer';
import { SignUpModal } from '@/components/SignUpModal';
import { useTextToCAD } from '@/hooks/useTextToCAD';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/hooks/useAuth';
import { EXAMPLE_PROMPTS } from '@/lib/prompts';

const MAX_CHARS = 500;

export function TextToCAD() {
  const [prompt, setPrompt] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { generate, scadCode, stlBuffer, isLoading, error, dimensions, reset } = useTextToCAD();
  const { user } = useAuth();
  const { remaining, total, hasCredits, useCredit } = useCredits(user?.id);

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    if (!hasCredits) {
      setShowSignUp(true);
      return;
    }

    const consumed = await useCredit(prompt.trim());
    if (!consumed) {
      setShowSignUp(true);
      return;
    }

    await generate(prompt.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    textareaRef.current?.focus();
  };

  const handleReset = () => {
    reset();
    setPrompt('');
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [prompt]);

  const charsLeft = MAX_CHARS - prompt.length;

  return (
    <div id="generator" className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-fab-cyan/10 border border-fab-cyan/20 rounded-full px-4 py-1.5 text-sm text-fab-cyan mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Text-to-CAD
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Describe your model
          </h2>
          <p className="text-white/50 max-w-lg mx-auto">
            Type anything from a simple box to a complex mechanical part. Our AI generates print-ready OpenSCAD code instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input Panel */}
          <div className="flex flex-col gap-4">
            {/* Prompt input */}
            <div className="relative">
              <div className={`
                rounded-xl border bg-fab-navy-mid transition-all duration-300
                ${isLoading
                  ? 'border-fab-cyan/30 shadow-[0_0_20px_rgba(0,212,255,0.1)]'
                  : 'border-white/10 hover:border-white/20 focus-within:border-fab-cyan/40 focus-within:shadow-[0_0_20px_rgba(0,212,255,0.08)]'
                }
              `}>
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., A hollow cylinder 40mm tall, 25mm diameter, 2mm wall thickness with a removable flat lid..."
                  disabled={isLoading}
                  rows={4}
                  className="w-full bg-transparent text-white placeholder-white/25 resize-none p-4 pb-2 text-sm leading-relaxed focus:outline-none disabled:opacity-50"
                />
                <div className="flex items-center justify-between px-4 pb-3">
                  <span className={`text-xs font-mono ${charsLeft < 50 ? 'text-red-400' : 'text-white/20'}`}>
                    {charsLeft} chars left
                  </span>
                  <div className="flex items-center gap-2">
                    {stlBuffer && (
                      <button
                        onClick={handleReset}
                        className="text-white/30 hover:text-white/60 transition-colors p-1 rounded"
                        title="Reset"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <Button
                      onClick={handleSubmit}
                      disabled={!prompt.trim() || isLoading}
                      size="sm"
                      className="gap-1.5"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border border-fab-navy/40 border-t-fab-navy rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Keyboard hint */}
              <p className="text-white/20 text-xs mt-1.5 ml-1">
                Press <kbd className="font-mono bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[10px]">⌘</kbd> + <kbd className="font-mono bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[10px]">Enter</kbd> to generate
              </p>
            </div>

            {/* Example prompts */}
            <div>
              <p className="text-white/30 text-xs mb-2 ml-1">Try an example:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.slice(0, 4).map((example) => (
                  <button
                    key={example}
                    onClick={() => handleExampleClick(example)}
                    disabled={isLoading}
                    className="text-xs text-white/50 bg-white/3 border border-white/8 hover:border-fab-cyan/30 hover:text-fab-cyan hover:bg-fab-cyan/5 rounded-lg px-3 py-1.5 transition-all duration-200 text-left disabled:opacity-40"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Credit counter */}
            <div className="flex items-center justify-between bg-white/2 border border-white/5 rounded-lg px-4 py-2.5">
              <div className="flex items-center gap-2">
                {typeof total === 'number' && (
                  <div className="flex gap-1">
                    {Array.from({ length: total }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i < remaining ? 'bg-fab-cyan' : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                )}
                <span className="text-sm text-white/50">
                  <span className="text-white font-medium">{remaining}</span>
                  <span>/{total} free generations today</span>
                </span>
              </div>
              {!hasCredits && (
                <button
                  onClick={() => setShowSignUp(true)}
                  className="text-xs text-fab-cyan hover:underline"
                >
                  Get more →
                </button>
              )}
            </div>

            {/* Error state */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-300 font-medium">Generation failed</p>
                  <p className="text-xs text-red-400/70 mt-1">{error}</p>
                  <button
                    onClick={() => handleSubmit()}
                    disabled={isLoading || !prompt.trim()}
                    className="text-xs text-red-400 hover:text-red-300 mt-2 underline disabled:opacity-50"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Export buttons */}
            {(stlBuffer || scadCode) && (
              <ExportButtons stlBuffer={stlBuffer} scadCode={scadCode} />
            )}

            {/* Raw code viewer */}
            {scadCode && <RawCodeViewer scadCode={scadCode} />}
          </div>

          {/* Right: 3D Viewer */}
          <div className="h-[500px] lg:h-auto lg:min-h-[600px]">
            <ModelViewer
              stlBuffer={stlBuffer}
              isLoading={isLoading}
              dimensions={dimensions}
            />
          </div>
        </div>
      </div>

      <SignUpModal isOpen={showSignUp} onClose={() => setShowSignUp(false)} />
    </div>
  );
}
