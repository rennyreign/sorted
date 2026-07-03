'use client';

import { Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  location: string;
  avatar: string;
}

interface TestimonialsFeaturedProps {
  eyebrow: string;
  title: string;
  featured: Testimonial;
  supporting: Testimonial[];
}

interface TestimonialsFeaturedStyleProps {
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

export default function TestimonialsFeatured({
  eyebrow,
  title,
  featured,
  supporting,
  theme = 'light',
  density = 'default',
  accentColor = '#2563EB',
  backgroundColor,
}: TestimonialsFeaturedProps & TestimonialsFeaturedStyleProps) {
  const isDark = theme === 'dark';
  const padding = densityPadding[density] ?? densityPadding.default;

  const bg = isDark ? '#0F172A' : '#FFFFFF';
  const headingColor = isDark ? '#FFFFFF' : '#0A0A0A';
  const featuredCardBg = isDark ? '#1E293B' : '#F8FAFC';
  const featuredCardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#E5E5E5';
  const quoteColor = isDark ? '#F1F5F9' : '#0A0A0A';
  const nameColor = isDark ? '#FFFFFF' : '#0A0A0A';
  const locationColor = isDark ? '#94A3B8' : '#525252';
  const supportingCardBg = isDark ? '#1E293B' : '#FFFFFF';
  const supportingCardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#E5E5E5';

  return (
    <section
      id="testimonials"
      className={`${padding}`}
      style={{ backgroundColor: backgroundColor ?? bg }}
    >
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="max-w-3xl mb-12 md:mb-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-px rounded-full" style={{ backgroundColor: accentColor }} />
            <span
              className="font-sans text-xs font-semibold uppercase tracking-[0.06em]"
              style={{ color: accentColor }}
            >
              {eyebrow}
            </span>
          </div>
          <h2
            className="font-sans font-bold leading-tight tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              color: headingColor,
            }}
          >
            {title}
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">

          {/* Featured testimonial */}
          <div
            className="lg:row-span-2 flex flex-col p-8 sm:p-10"
            style={{
              backgroundColor: featuredCardBg,
              border: `1px solid ${featuredCardBorder}`,
            }}
          >
            <Quote
              className="w-10 h-10 mb-6 flex-shrink-0"
              style={{ color: accentColor }}
              strokeWidth={1.5}
            />
            <blockquote className="flex-1">
              <p
                className="font-sans text-xl sm:text-2xl leading-relaxed mb-8"
                style={{ color: quoteColor }}
              >
                &ldquo;{featured.quote}&rdquo;
              </p>
            </blockquote>
            <div className="flex items-center gap-4 mt-auto pt-6" style={{ borderTop: `1px solid ${featuredCardBorder}` }}>
              <div
                className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: `2px solid ${accentColor}` }}
              >
                <img
                  src={featured.avatar}
                  alt={featured.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="font-sans font-semibold text-base" style={{ color: nameColor }}>
                  {featured.name}
                </p>
                <p className="font-sans text-sm" style={{ color: locationColor }}>
                  {featured.location}
                </p>
              </div>
            </div>
          </div>

          {/* Supporting testimonials */}
          {supporting.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col p-6 sm:p-8 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1"
              style={{
                backgroundColor: supportingCardBg,
                border: `1px solid ${supportingCardBorder}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
              }}
            >
              <Quote
                className="w-7 h-7 mb-4 flex-shrink-0"
                style={{ color: accentColor }}
                strokeWidth={1.5}
              />
              <blockquote className="flex-1 mb-6">
                <p
                  className="font-sans text-base leading-relaxed"
                  style={{ color: quoteColor }}
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </blockquote>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                  style={{ border: `2px solid ${accentColor}` }}
                >
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <p className="font-sans font-semibold text-sm" style={{ color: nameColor }}>
                    {testimonial.name}
                  </p>
                  <p className="font-sans text-sm" style={{ color: locationColor }}>
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
