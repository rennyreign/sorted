interface Credential {
  label: string;
}

interface AboutSplitCredentialsProps {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  credentials: Credential[];
}

interface AboutSplitCredentialsStyleProps {
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

export default function AboutSplitCredentials({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  credentials,
  theme = 'light',
  density = 'default',
  accentColor = '#2563EB',
  backgroundColor,
}: AboutSplitCredentialsProps & AboutSplitCredentialsStyleProps) {
  const isDark = theme === 'dark';
  const padding = densityPadding[density] ?? densityPadding.default;

  const bg = isDark ? '#0F172A' : '#F8FAFC';
  const headingColor = isDark ? '#FFFFFF' : '#0A0A0A';
  const bodyColor = isDark ? '#94A3B8' : '#525252';
  const credentialColor = isDark ? '#E2E8F0' : '#0A0A0A';

  return (
    <section
      id="about"
      className={`relative ${padding}`}
      style={{ backgroundColor: backgroundColor ?? bg }}
    >
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20 items-center">

          {/* Image column — tall, fills grid row height */}
          <div className="relative">
            <div
              className="overflow-hidden w-full"
              style={{
                aspectRatio: '3/4',
                minHeight: '480px',
                borderRadius: '1rem',
                boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
              }}
            >
              <img
                src={image}
                alt={imageAlt}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
            </div>
          </div>

          {/* Content column */}
          <div className="flex flex-col justify-center">
            <div
              className="pl-6"
              style={{ borderLeft: `4px solid ${accentColor}` }}
            >
              <div className="flex items-center gap-2 mb-5">
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
                  fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)',
                  color: headingColor,
                }}
              >
                {title}
              </h2>
              <p
                className="mt-5 text-base lg:text-lg leading-relaxed max-w-[55ch]"
                style={{ color: bodyColor }}
              >
                {description}
              </p>
              <ul className="mt-8 space-y-4">
                {credentials.map((credential, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: accentColor }}
                    >
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span
                      className="font-sans font-medium text-base"
                      style={{ color: credentialColor }}
                    >
                      {credential.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
