import { Phone, MessageCircle } from 'lucide-react';

interface CTABandPhoneProps {
  headline: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

interface CTABandPhoneStyleProps {
  theme?: 'light' | 'dark';
  density?: 'default' | 'compressed' | 'airy';
  accentColor?: string;
  backgroundColor?: string;
}

const densityPadding = {
  compressed: 'py-24 sm:py-28 lg:py-32',
  default:    'py-28 sm:py-32 lg:py-36',
  airy:       'py-32 sm:py-36 lg:py-44',
};

export default function CTABandPhone({
  headline,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  theme = 'dark',
  density = 'default',
  accentColor = '#2563EB',
  backgroundColor,
}: CTABandPhoneProps & CTABandPhoneStyleProps) {
  const isDark = theme === 'dark';
  const padding = densityPadding[density] ?? densityPadding.default;

  // CTA always uses a strong dark treatment for maximum contrast and urgency
  const bg = isDark ? '#0A0A0A' : '#0F172A';
  const headingColor = '#FFFFFF';
  const descColor = '#94A3B8';

  return (
    <section
      id="cta"
      className={`relative ${padding}`}
      style={{ backgroundColor: backgroundColor ?? bg }}
    >
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16">
        <div className="max-w-4xl">
          <h2
            className="font-sans font-extrabold leading-[0.95] tracking-[-0.02em]"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              color: headingColor,
            }}
          >
            {headline}
          </h2>
          <p
            className="mt-6 text-base lg:text-lg leading-relaxed max-w-[60ch]"
            style={{ color: descColor }}
          >
            {description}
          </p>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <a
              href={primaryHref}
              className="inline-flex items-center gap-3 rounded-lg px-8 py-4 font-sans font-semibold text-white text-lg shadow-lg transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
              style={{ backgroundColor: accentColor }}
            >
              <Phone className="h-5 w-5 flex-shrink-0" />
              <span>{primaryLabel}</span>
            </a>

            {secondaryLabel && secondaryHref && (
              <a
                href={secondaryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-lg border-2 bg-transparent px-8 py-4 font-sans font-semibold text-white text-lg transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[#25D366] hover:bg-[#25D366]/10"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <MessageCircle className="h-5 w-5 flex-shrink-0" />
                <span>{secondaryLabel}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
