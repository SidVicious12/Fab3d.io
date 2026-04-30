import { useRef } from 'react';
import { ArrowDown, Cpu, Download, Eye, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Landing() {
  const generatorRef = useRef<HTMLElement>(null);

  const scrollToGenerator = () => {
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-fab-cyan/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-fab-cyan/10 border border-fab-cyan/20 rounded-full px-5 py-2 text-sm text-fab-cyan mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-fab-cyan animate-pulse" />
            Free to try · No CAD skills needed
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            Turn Words into{' '}
            <span className="relative">
              <span className="text-fab-cyan">3D Models</span>
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-fab-cyan/0 via-fab-cyan to-fab-cyan/0" />
            </span>
            {'. '}
            <span className="text-white/60">Instantly.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Describe what you want to print. Fab3D AI generates a ready-to-print STL in seconds.{' '}
            <span className="text-white/70">No CAD skills required.</span>
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="xl"
              onClick={scrollToGenerator}
              className="animate-glow-pulse"
            >
              <Zap className="w-5 h-5" />
              Try It Free →
            </Button>
            <p className="text-white/30 text-sm">
              5 free generations per day · No signup
            </p>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-white/30">
            <div className="flex -space-x-2">
              {['#4a9', '#47b', '#59c', '#6ad', '#5be'].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-fab-navy" style={{ background: c }} />
              ))}
            </div>
            <span>Join 500+ makers generating models with Fab3D AI</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToGenerator}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 hover:text-fab-cyan transition-colors flex flex-col items-center gap-2"
        >
          <span className="text-xs tracking-widest uppercase">Try it now</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </button>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
            <p className="text-white/40">From prompt to printable model in three steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Cpu,
                step: '01',
                title: 'Describe your model',
                description: 'Type a natural language description of what you want to 3D print. Be as specific or general as you like.',
              },
              {
                icon: Eye,
                step: '02',
                title: 'AI generates & compiles',
                description: 'Our AI writes optimized OpenSCAD code, which is compiled in your browser — no servers, no waiting.',
              },
              {
                icon: Download,
                step: '03',
                title: 'Download & print',
                description: 'Preview in 3D, rotate and inspect, then download the STL file ready for your slicer.',
              },
            ].map(({ icon: Icon, step, title, description }) => (
              <div
                key={step}
                className="relative bg-fab-navy-mid border border-white/5 hover:border-fab-cyan/20 rounded-2xl p-6 transition-all duration-300 group"
              >
                <div className="absolute top-4 right-4 text-5xl font-black text-white/3 group-hover:text-fab-cyan/5 transition-colors">
                  {step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-fab-cyan/10 border border-fab-cyan/20 flex items-center justify-center mb-4 group-hover:bg-fab-cyan/15 transition-colors">
                  <Icon className="w-5 h-5 text-fab-cyan" />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '<30s', label: 'Generation time' },
              { value: '100%', label: 'Browser native' },
              { value: 'Free', label: 'To get started' },
              { value: 'STL + SCAD', label: 'Export formats' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/2 border border-white/5 rounded-xl py-6 px-4">
                <div className="text-2xl font-bold text-fab-cyan mb-1">{value}</div>
                <div className="text-sm text-white/40">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to print your idea?
          </h2>
          <p className="text-white/40 mb-8">
            No account needed. No credit card. Just describe and download.
          </p>
          <Button size="xl" onClick={scrollToGenerator}>
            <Zap className="w-5 h-5" />
            Start Generating Free →
          </Button>
        </div>
      </section>
    </>
  );
}
