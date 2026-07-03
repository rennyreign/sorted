'use client';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterStandardProps {
  logo: string;
  brandName: string;
  tagline: string;
  quickLinks: FooterLink[];
  contact: {
    phone: string;
    phoneHref: string;
    availability: string;
  };
  serviceAreas: string[];
  legalLinks: FooterLink[];
  copyright: string;
}

interface FooterStandardStyleProps {
  theme?: 'light' | 'dark';
  accentColor?: string;
  backgroundColor?: string;
}

export default function FooterStandard({
  logo,
  brandName,
  tagline,
  quickLinks,
  contact,
  serviceAreas,
  legalLinks,
  copyright,
  theme = 'dark',
  accentColor = '#2563EB',
  backgroundColor,
}: FooterStandardProps & FooterStandardStyleProps) {
  const isDark = theme === 'dark';

  const bg = isDark ? '#0A0A0A' : '#F8FAFC';
  const brandColor = isDark ? '#FFFFFF' : '#0A0A0A';
  const taglineColor = isDark ? '#64748B' : '#525252';
  const headingColor = isDark ? '#64748B' : '#8A8A8A';
  const linkColor = isDark ? '#94A3B8' : '#525252';
  const linkHoverColor = isDark ? '#FFFFFF' : '#0A0A0A';
  const phoneColor = isDark ? '#E2E8F0' : '#0A0A0A';
  const availColor = isDark ? '#64748B' : '#8A8A8A';
  const serviceAreaColor = isDark ? '#94A3B8' : '#525252';
  const dividerColor = isDark ? '#1E293B' : '#E5E5E5';
  const copyrightColor = isDark ? '#475569' : '#8A8A8A';

  return (
    <footer
      className="py-16 sm:py-20"
      style={{ backgroundColor: backgroundColor ?? bg }}
    >
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src={logo}
                alt={brandName}
                className="w-9 h-9 object-contain"
              />
              <span
                className="font-sans font-bold text-base"
                style={{ color: brandColor }}
              >
                {brandName}
              </span>
            </div>
            <p
              className="text-sm leading-relaxed max-w-[36ch]"
              style={{ color: taglineColor }}
            >
              {tagline}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3
              className="font-sans font-semibold text-xs uppercase tracking-[0.14em] mb-5"
              style={{ color: headingColor }}
            >
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors duration-150"
                    style={{ color: linkColor }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = linkHoverColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="font-sans font-semibold text-xs uppercase tracking-[0.14em] mb-5"
              style={{ color: headingColor }}
            >
              Contact
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <a
                  href={contact.phoneHref}
                  className="transition-colors duration-150"
                  style={{ color: phoneColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = phoneColor)}
                >
                  {contact.phone}
                </a>
              </p>
              <p style={{ color: availColor }}>{contact.availability}</p>
            </div>
          </div>

          {/* Service areas */}
          <div>
            <h3
              className="font-sans font-semibold text-xs uppercase tracking-[0.14em] mb-5"
              style={{ color: headingColor }}
            >
              Service Areas
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: serviceAreaColor }}
            >
              {serviceAreas.join(', ')}
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          style={{ borderTop: `1px solid ${dividerColor}` }}
        >
          <p className="text-xs" style={{ color: copyrightColor }}>{copyright}</p>
          <div className="flex flex-wrap gap-5">
            {legalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs transition-colors duration-150"
                style={{ color: copyrightColor }}
                onMouseEnter={(e) => (e.currentTarget.style.color = linkHoverColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = copyrightColor)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
