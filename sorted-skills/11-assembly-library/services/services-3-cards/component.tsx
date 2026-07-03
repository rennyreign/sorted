'use client';

import { Phone } from 'lucide-react';

interface Service {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  link: string;
  linkLabel: string;
}

interface Services3CardsProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  services: Service[];
}

interface Services3CardsStyleProps {
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

export default function Services3Cards({
  eyebrow,
  title,
  subtitle,
  services,
  theme = 'light',
  density = 'default',
  accentColor = '#2563EB',
  backgroundColor,
}: Services3CardsProps & Services3CardsStyleProps) {
  const isDark = theme === 'dark';
  const padding = densityPadding[density] ?? densityPadding.default;

  // Section uses off-white so white cards have contrast against the background
  const bg = isDark ? '#0F172A' : '#F8FAFC';
  const headingColor = isDark ? '#FFFFFF' : '#0A0A0A';
  const subColor = isDark ? '#94A3B8' : '#525252';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const cardTitleColor = isDark ? '#FFFFFF' : '#0A0A0A';
  const cardBodyColor = isDark ? '#94A3B8' : '#525252';

  return (
    <section
      id="services"
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
          <p
            className="mt-4 text-base lg:text-lg leading-relaxed max-w-[60ch]"
            style={{ color: subColor }}
          >
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group flex flex-col overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1.5"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 36px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
              }}
            >
              <div className="overflow-hidden" style={{ aspectRatio: '16/10' }}>
                <img
                  src={service.image}
                  alt={service.imageAlt}
                  className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col flex-1 p-6 sm:p-8">
                <h3
                  className="font-sans font-bold text-xl mb-3"
                  style={{ color: cardTitleColor }}
                >
                  {service.title}
                </h3>
                <p
                  className="text-base leading-relaxed flex-1 mb-6"
                  style={{ color: cardBodyColor }}
                >
                  {service.description}
                </p>
                <a
                  href={service.link}
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-3 mt-auto"
                  style={{ color: accentColor }}
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{service.linkLabel}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
