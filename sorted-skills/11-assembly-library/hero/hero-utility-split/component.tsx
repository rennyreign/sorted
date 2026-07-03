'use client';

import { Phone, MessageCircle } from 'lucide-react';

interface HeroUtilitySplitProps {
  eyebrow?: string;
  headline: string;
  description: string;
  primary_cta: {
    label: string;
    href: string;
  };
  secondary_cta?: {
    label: string;
    href: string;
  };
  hero_image: string;
  hero_image_alt: string;
}

interface HeroUtilitySplitStyleProps {
  theme?: 'light' | 'dark';
  density?: 'default' | 'compressed' | 'airy';
  accentColor?: string;
  backgroundColor?: string;
}

// pt-20 clears the fixed nav (h-16 lg:h-20).
// min-h-[90vh] ensures confident viewport fill.
// Using vh (not dvh) — dvh is unreliable during static export HTML generation.
// pt clears the fixed nav. pb creates breathing room above the trust strip.
const densityPaddingLeft = {
  compressed: 'pt-28 pb-28 sm:pt-32 sm:pb-32',
  default:    'pt-32 pb-32 sm:pt-36 sm:pb-36',
  airy:       'pt-36 pb-36 sm:pt-40 sm:pb-40',
};

export default function HeroUtilitySplit({
  eyebrow,
  headline,
  description,
  primary_cta,
  secondary_cta,
  hero_image,
  hero_image_alt,
  theme = 'dark',
  density = 'default',
  accentColor = '#2563EB',
  backgroundColor,
}: HeroUtilitySplitProps & HeroUtilitySplitStyleProps) {
  const isDark = theme === 'dark';
  const paddingLeft = densityPaddingLeft[density] ?? densityPaddingLeft.default;
  const bg = isDark ? '#0F172A' : '#FFFFFF';

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] overflow-hidden"
      style={{ backgroundColor: backgroundColor ?? bg }}
    >
      {/* Full-height image — pinned to right edge, fills entire hero height */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 overflow-hidden">
        <img
          src={hero_image}
          alt={hero_image_alt}
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Fade left edge into bg on desktop so text reads cleanly */}
        <div
          className="absolute inset-y-0 left-0 w-32 hidden lg:block"
          style={{
            background: `linear-gradient(to right, ${backgroundColor ?? bg}, transparent)`,
          }}
        />
        {/* Subtle bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
        {/* Mobile overlay so text is legible */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{ backgroundColor: `${backgroundColor ?? bg}cc` }}
        />
      </div>

      {/* Content — sits above the image */}
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16 w-full min-h-[90vh] flex items-center">
        <div className={`w-full lg:w-1/2 ${paddingLeft}`}>
          {eyebrow && (
            <div className="flex items-center gap-2 mb-5">
              <div className="w-5 h-px rounded-full" style={{ backgroundColor: accentColor }} />
              <span
                className="font-sans text-xs font-semibold uppercase tracking-[0.06em]"
                style={{ color: accentColor }}
              >
                {eyebrow}
              </span>
            </div>
          )}
          <h1
            className="font-sans font-extrabold leading-[0.92] tracking-[-0.03em]"
            style={{
              fontSize: 'clamp(3rem, 7vw, 6.5rem)',
              color: isDark ? '#FFFFFF' : '#0A0A0A',
            }}
          >
            {headline}
          </h1>
          <p
            className="mt-6 text-lg leading-relaxed max-w-[48ch]"
            style={{ color: isDark ? '#94A3B8' : '#525252' }}
          >
            {description}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
            <a
              href={primary_cta.href}
              className="inline-flex items-center gap-3 rounded-lg px-7 py-4 font-sans font-semibold text-white text-base shadow-lg transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
              style={{ backgroundColor: accentColor }}
            >
              <Phone className="h-5 w-5 flex-shrink-0" />
              <span>{primary_cta.label}</span>
            </a>
            {secondary_cta && (
              <a
                href={secondary_cta.href}
                className="inline-flex items-center gap-2 font-sans font-semibold text-base transition-all duration-200 hover:gap-3 py-4"
                style={{ color: isDark ? '#FFFFFF' : accentColor }}
              >
                <MessageCircle className="h-5 w-5 flex-shrink-0" />
                <span>{secondary_cta.label}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
