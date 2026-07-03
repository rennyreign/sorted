import { Phone, Search, Wrench, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  phone: Phone,
  search: Search,
  wrench: Wrench,
};

interface Step {
  number: string;
  icon: string;
  label: string;
  description: string;
}

interface ProcessSteps3Props {
  eyebrow: string;
  title: string;
  steps: Step[];
}

interface ProcessSteps3StyleProps {
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

export default function ProcessSteps3({
  eyebrow,
  title,
  steps,
  theme = 'light',
  density = 'default',
  accentColor = '#2563EB',
  backgroundColor,
}: ProcessSteps3Props & ProcessSteps3StyleProps) {
  const isDark = theme === 'dark';
  const padding = densityPadding[density] ?? densityPadding.default;

  const bg = isDark ? '#0F172A' : '#FFFFFF';
  const headingColor = isDark ? '#FFFFFF' : '#0A0A0A';
  const stepLabelColor = isDark ? '#FFFFFF' : '#0A0A0A';
  const stepBodyColor = isDark ? '#94A3B8' : '#525252';
  const connectorColor = isDark ? 'rgba(255,255,255,0.10)' : '#E5E5E5';

  return (
    <section
      id="process"
      className={`${padding}`}
      style={{ backgroundColor: backgroundColor ?? bg }}
    >
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span
            className="font-mono text-xs font-semibold uppercase tracking-[0.18em] mb-4 block"
            style={{ color: accentColor }}
          >
            {eyebrow}
          </span>
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

        {/* Steps with connector lines between them on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon] || Wrench;
            const isLast = index === steps.length - 1;
            return (
              <div key={index} className="flex flex-col items-center text-center relative">
                {/* Icon with connector line extending right (not on last step) */}
                <div className="relative flex items-center justify-center w-full mb-5">
                  {!isLast && (
                    <div
                      className="hidden md:block absolute h-px"
                      style={{
                        backgroundColor: connectorColor,
                        left: 'calc(50% + 24px)',
                        right: 'calc(-50% + 24px)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />
                  )}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center relative z-10 flex-shrink-0"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                </div>
                <div
                  className="font-sans text-[10px] uppercase tracking-[0.06em] font-semibold mb-3"
                  style={{ color: accentColor }}
                >
                  Step {step.number}
                </div>
                <h3
                  className="font-sans font-bold text-xl mb-3"
                  style={{ color: stepLabelColor }}
                >
                  {step.label}
                </h3>
                <p
                  className="text-base leading-relaxed max-w-[36ch]"
                  style={{ color: stepBodyColor }}
                >
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
