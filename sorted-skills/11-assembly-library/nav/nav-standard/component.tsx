'use client';

import { useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';

interface NavLink {
  label: string;
  href: string;
}

interface NavStandardProps {
  logo: string;
  brandName: string;
  navLinks: NavLink[];
  phone: string;
  phoneHref: string;
  ctaLabel: string;
  ctaHref: string;
}

interface NavStandardStyleProps {
  theme?: 'light' | 'dark';
  accentColor?: string;
  backgroundColor?: string;
}

export default function NavStandard({
  logo,
  brandName,
  navLinks,
  phone,
  phoneHref,
  ctaLabel,
  ctaHref,
  theme = 'light',
  accentColor = '#2563EB',
  backgroundColor,
}: NavStandardProps & NavStandardStyleProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = theme === 'dark';

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  const bgColor = backgroundColor ?? (isDark ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.96)');
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#E5E5E5';
  const brandColor = isDark ? '#FFFFFF' : '#0A0A0A';
  const linkColor = isDark ? '#94A3B8' : '#525252';
  const phoneColor = isDark ? '#E2E8F0' : '#0A0A0A';
  const mobileBg = isDark ? '#0F172A' : '#FFFFFF';
  const mobileLinkColor = isDark ? '#FFFFFF' : '#0A0A0A';

  // If the CTA button already shows the phone number, hide the standalone phone link
  const phoneDigits = phone.replace(/\D/g, '');
  const ctaDigits = ctaLabel.replace(/\D/g, '');
  const ctaIsPhone = phoneDigits.length > 0 && ctaDigits.length > 0 && (ctaLabel.includes(phone) || ctaLabel.includes(phoneDigits) || ctaDigits.includes(phoneDigits));

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
        style={{
          backgroundColor: bgColor,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <nav className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Brand */}
            <a href="#" className="flex items-center gap-2.5 flex-shrink-0">
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
            </a>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-sm font-medium transition-colors duration-150"
                  style={{ color: linkColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-5">
              {!ctaIsPhone && (
                <a
                  href={phoneHref}
                  className="flex items-center gap-2 text-sm font-medium transition-colors duration-150"
                  style={{ color: phoneColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = phoneColor)}
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{phone}</span>
                </a>
              )}
              <a
                href={ctaHref}
                className="text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
                style={{ backgroundColor: accentColor }}
              >
                {ctaLabel}
              </a>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-md transition-colors"
              style={{ color: isDark ? '#FFFFFF' : '#0A0A0A' }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0" style={{ backgroundColor: mobileBg }} />
        <div className="relative h-full flex flex-col items-center justify-center gap-8 pt-20">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-2xl font-bold transition-colors duration-150"
              style={{ color: mobileLinkColor }}
              onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = mobileLinkColor)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col items-center gap-4 mt-6">
            {!ctaIsPhone && (
              <a
                href={phoneHref}
                className="flex items-center gap-2 text-lg font-medium"
                style={{ color: phoneColor }}
              >
                <Phone className="w-5 h-5" />
                <span>{phone}</span>
              </a>
            )}
            <a
              href={ctaHref}
              className="text-white px-8 py-4 rounded-full text-lg font-semibold"
              style={{ backgroundColor: accentColor }}
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
