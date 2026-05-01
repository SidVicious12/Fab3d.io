import { Check, Zap, Building2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    description: 'Get started with basic 3D generation',
    icon: Sparkles,
    features: [
      '5 generations per day',
      'Basic OpenSCAD export',
      'STL download',
      'Browser-based 3D preview',
    ],
    cta: 'Get Started Free',
    variant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    description: 'For makers who want more power',
    icon: Zap,
    features: [
      'Unlimited generations',
      'Priority generation queue',
      'All export formats (STL, SCAD, 3MF)',
      'Generation history',
      'Custom model parameters',
    ],
    cta: 'Upgrade to Pro',
    variant: 'default' as const,
    popular: true,
  },
  {
    name: 'Team',
    price: '$49',
    period: '/mo',
    description: 'Collaborate and scale your workflow',
    icon: Building2,
    features: [
      'Everything in Pro',
      '5 team members',
      'Shared model library',
      'API access',
      'Priority support',
    ],
    cta: 'Start Team Plan',
    variant: 'outline' as const,
    popular: false,
  },
];

const faqs = [
  {
    q: 'Can I try Fab3D for free?',
    a: 'Yes! The Free plan gives you 5 generations per day with no signup required. You can start generating 3D models right away.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Absolutely. All plans are month-to-month with no long-term commitment. Cancel anytime from your account settings.',
  },
  {
    q: 'What export formats are supported?',
    a: 'Free users get STL and basic OpenSCAD export. Pro and Team plans unlock all formats including STL, SCAD, and 3MF.',
  },
  {
    q: 'How does team billing work?',
    a: 'The Team plan covers up to 5 members under one subscription. You can add or remove members anytime. Need more seats? Contact us.',
  },
];

export function Pricing() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Start free. Upgrade when you need more. No hidden fees.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-fab-navy-mid border rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                plan.popular
                  ? 'border-fab-cyan/30 shadow-[0_0_40px_rgba(0,212,255,0.12)]'
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-fab-cyan text-fab-navy text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                plan.popular
                  ? 'bg-fab-cyan/15 border border-fab-cyan/25'
                  : 'bg-white/5 border border-white/10'
              }`}>
                <plan.icon className={`w-5 h-5 ${plan.popular ? 'text-fab-cyan' : 'text-white/50'}`} />
              </div>

              {/* Plan name & price */}
              <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
              <p className="text-white/40 text-sm mb-4">{plan.description}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-white/40 text-sm">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-fab-cyan' : 'text-white/40'}`} />
                    <span className="text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button variant={plan.variant} size="lg" className="w-full">
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-fab-navy-mid border border-white/5 rounded-xl p-5"
              >
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
