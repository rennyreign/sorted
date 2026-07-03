import { Clock, MapPin, Zap, BadgeCheck, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  clock: Clock,
  mapPin: MapPin,
  zap: Zap,
  badgeCheck: BadgeCheck,
};

interface TrustStatStripProps {
  stats: {
    icon: string;
    stat: string;
    label: string;
  }[];
}

interface TrustStatStripStyleProps {
  theme?: 'light' | 'dark';
  density?: 'default' | 'compressed' | 'airy';
  accentColor?: string;
  backgroundColor?: string;
}

const densityPadding = {
  compressed: 'py-20 sm:py-24',
  default:    'py-24 sm:py-28 lg:py-32',
  airy:       'py-28 sm:py-32 lg:py-36',
};

export default function TrustStatStrip({
  stats,
  theme = 'light',
  density = 'default',
  accentColor = '#2563EB',
  backgroundColor,
}: TrustStatStripProps & TrustStatStripStyleProps) {
  const isDark = theme === 'dark';
  const padding = densityPadding[density] ?? densityPadding.default;

  const bg = isDark ? '#1E293B' : '#F8FAFC';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const statColor = isDark ? '#FFFFFF' : '#0A0A0A';
  const labelColor = isDark ? '#94A3B8' : '#525252';

  return (
    <section
      id="trust"
      className={`${padding}`}
      style={{
        backgroundColor: backgroundColor ?? bg,
        borderTop: `1px solid ${borderColor}`,
        borderBottom: `1px solid ${borderColor}`,
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((item, index) => {
            const Icon = iconMap[item.icon] || BadgeCheck;
            return (
              <div key={index} className="flex flex-col items-center text-center gap-3">
                <Icon className="w-5 h-5 flex-shrink-0" style={{ color: accentColor }} strokeWidth={2} />
                <div>
                  <div
                    className="font-sans font-extrabold text-2xl sm:text-3xl leading-none tracking-tight"
                    style={{ color: statColor }}
                  >
                    {item.stat}
                  </div>
                  <div
                    className="mt-1 font-sans text-sm leading-snug"
                    style={{ color: labelColor }}
                  >
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
