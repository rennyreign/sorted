'use client';

import { CheckCircle2 } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

interface ProofGallery2Props {
  eyebrow: string;
  title: string;
  projects: Project[];
}

interface ProofGallery2StyleProps {
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

export default function ProofGallery2({
  eyebrow,
  title,
  projects,
  theme = 'light',
  density = 'default',
  accentColor = '#2563EB',
  backgroundColor,
}: ProofGallery2Props & ProofGallery2StyleProps) {
  const isDark = theme === 'dark';
  const padding = densityPadding[density] ?? densityPadding.default;

  const bg = isDark ? '#0F172A' : '#F2F2F0';
  const headingColor = isDark ? '#FFFFFF' : '#0A0A0A';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#E5E5E5';
  const cardTitleColor = isDark ? '#FFFFFF' : '#0A0A0A';
  const cardBodyColor = isDark ? '#94A3B8' : '#525252';

  return (
    <section
      id="work"
      className={`relative ${padding}`}
      style={{ backgroundColor: backgroundColor ?? bg }}
    >
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16">
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

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1.5"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.10)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
              }}
            >
              <div className="overflow-hidden" style={{ aspectRatio: '16/10' }}>
                <img
                  src={project.image}
                  alt={project.imageAlt}
                  className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div
                className="p-6 sm:p-8"
                style={{ borderTop: `1px solid ${cardBorder}` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle2
                    className="h-5 w-5 mt-0.5 flex-shrink-0"
                    style={{ color: accentColor }}
                  />
                  <h3
                    className="font-sans font-bold text-xl leading-tight"
                    style={{ color: cardTitleColor }}
                  >
                    {project.title}
                  </h3>
                </div>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: cardBodyColor }}
                >
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
