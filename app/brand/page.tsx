'use client';

import { useState } from 'react';

export default function BrandGuidelines() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadSVG = (svgContent: string, filename: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPNG = (svgContent: string, filename: string, width: number, height: number, bgColor?: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      canvas.width = width * 2;
      canvas.height = height * 2;
      ctx.scale(2, 2);
      
      if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  // Logo SVGs - using Plus Jakarta Sans
  const fontFamily = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
  const sMarkBlack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="75" font-family="${fontFamily}" font-size="70" font-weight="900" fill="#0A0A0A" text-anchor="middle">S.</text></svg>`;
  const sMarkWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="75" font-family="${fontFamily}" font-size="70" font-weight="900" fill="#FFFFFF" text-anchor="middle">S.</text></svg>`;
  const sortedBlack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><text x="0" y="32" font-family="${fontFamily}" font-size="32" font-weight="800" fill="#0A0A0A" letter-spacing="-0.02em">Sorted.</text></svg>`;
  const sortedWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><text x="0" y="32" font-family="${fontFamily}" font-size="32" font-weight="800" fill="#FFFFFF" letter-spacing="-0.02em">Sorted.</text></svg>`;
  const sMarkCircleBlack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" stroke="#0A0A0A" stroke-width="7" fill="none"/><text x="50" y="68" font-family="${fontFamily}" font-size="50" font-weight="900" fill="#0A0A0A" text-anchor="middle">S.</text></svg>`;
  const sMarkCircleWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" stroke="#FFFFFF" stroke-width="7" fill="none"/><text x="50" y="68" font-family="${fontFamily}" font-size="50" font-weight="900" fill="#FFFFFF" text-anchor="middle">S.</text></svg>`;

  const colors = [
    { name: 'Primary Black', hex: '#0A0A0A', rgb: '10, 10, 10' },
    { name: 'Off White', hex: '#FAFAFA', rgb: '250, 250, 250' },
    { name: 'Text Grey', hex: '#525252', rgb: '82, 82, 82' },
    { name: 'Border Grey', hex: '#E5E5E5', rgb: '229, 229, 229' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero */}
      <section className="bg-[#0A0A0A] text-white py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div dangerouslySetInnerHTML={{ __html: sortedWhite }} className="w-48 mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Brand Guidelines
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Everything you need to represent the Sorted brand consistently across all touchpoints.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-8 py-16 space-y-20">
        {/* Logo Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm font-bold text-[#525252] uppercase tracking-wider">01</span>
            <h2 className="text-3xl font-extrabold text-[#0A0A0A]">Logo</h2>
          </div>
          
          <p className="text-[#525252] text-lg mb-8 max-w-3xl">
            The Sorted brand uses two primary logo variants: the S. mark for icons and favicons, 
            and the full Sorted. wordmark for headers and branding. Both should always appear 
            with the period as part of the identity.
          </p>

          {/* S Mark */}
          <div className="mb-12">
            <h3 className="text-xl font-bold text-[#0A0A0A] mb-6">S. Mark</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E5E5E5]">
                <div className="h-32 flex items-center justify-center mb-4">
                  <div dangerouslySetInnerHTML={{ __html: sMarkBlack }} className="w-24 h-24" />
                </div>
                <p className="text-sm text-[#525252] mb-3">Primary on light</p>
                <div className="flex gap-2">
                  <button onClick={() => downloadSVG(sMarkBlack, 'sorted-s-mark.svg')} className="flex-1 px-3 py-2 bg-[#0A0A0A] text-white text-sm rounded hover:bg-gray-800">SVG</button>
                  <button onClick={() => downloadPNG(sMarkBlack, 'sorted-s-mark.png', 400, 400)} className="flex-1 px-3 py-2 border border-[#E5E5E5] text-[#0A0A0A] text-sm rounded hover:bg-gray-50">PNG</button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E5E5E5]">
                <div className="h-32 flex items-center justify-center mb-4 bg-gray-100" style={{background: 'repeating-conic-gradient(#e5e5e5 0% 25%, #fff 0% 50%) 50% / 20px 20px'}}>
                  <div dangerouslySetInnerHTML={{ __html: sMarkBlack }} className="w-24 h-24" />
                </div>
                <p className="text-sm text-[#525252] mb-3">Transparent</p>
                <div className="flex gap-2">
                  <button onClick={() => downloadSVG(sMarkBlack, 'sorted-s-mark.svg')} className="flex-1 px-3 py-2 bg-[#0A0A0A] text-white text-sm rounded hover:bg-gray-800">SVG</button>
                  <button onClick={() => downloadPNG(sMarkBlack, 'sorted-s-mark-transparent.png', 400, 400)} className="flex-1 px-3 py-2 border border-[#E5E5E5] text-[#0A0A0A] text-sm rounded hover:bg-gray-50">PNG</button>
                </div>
              </div>

              <div className="bg-[#0A0A0A] rounded-xl p-8 shadow-sm">
                <div className="h-32 flex items-center justify-center mb-4">
                  <div dangerouslySetInnerHTML={{ __html: sMarkWhite }} className="w-24 h-24" />
                </div>
                <p className="text-sm text-gray-400 mb-3">Reversed on dark</p>
                <div className="flex gap-2">
                  <button onClick={() => downloadSVG(sMarkWhite, 'sorted-s-mark-white.svg')} className="flex-1 px-3 py-2 bg-white text-[#0A0A0A] text-sm rounded hover:bg-gray-100">SVG</button>
                  <button onClick={() => downloadPNG(sMarkWhite, 'sorted-s-mark-white.png', 400, 400, '#0A0A0A')} className="flex-1 px-3 py-2 border border-gray-600 text-white text-sm rounded hover:bg-gray-800">PNG</button>
                </div>
              </div>
            </div>
          </div>

          {/* Full Wordmark */}
          <div className="mb-12">
            <h3 className="text-xl font-bold text-[#0A0A0A] mb-6">Sorted. Wordmark</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E5E5E5]">
                <div className="h-32 flex items-center justify-center mb-4">
                  <div dangerouslySetInnerHTML={{ __html: sortedBlack }} className="w-full max-w-[180px]" />
                </div>
                <p className="text-sm text-[#525252] mb-3">Primary on light</p>
                <div className="flex gap-2">
                  <button onClick={() => downloadSVG(sortedBlack, 'sorted-wordmark.svg')} className="flex-1 px-3 py-2 bg-[#0A0A0A] text-white text-sm rounded hover:bg-gray-800">SVG</button>
                  <button onClick={() => downloadPNG(sortedBlack, 'sorted-wordmark.png', 400, 134)} className="flex-1 px-3 py-2 border border-[#E5E5E5] text-[#0A0A0A] text-sm rounded hover:bg-gray-50">PNG</button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E5E5E5]">
                <div className="h-32 flex items-center justify-center mb-4" style={{background: 'repeating-conic-gradient(#e5e5e5 0% 25%, #fff 0% 50%) 50% / 20px 20px'}}>
                  <div dangerouslySetInnerHTML={{ __html: sortedBlack }} className="w-full max-w-[180px]" />
                </div>
                <p className="text-sm text-[#525252] mb-3">Transparent</p>
                <div className="flex gap-2">
                  <button onClick={() => downloadSVG(sortedBlack, 'sorted-wordmark.svg')} className="flex-1 px-3 py-2 bg-[#0A0A0A] text-white text-sm rounded hover:bg-gray-800">SVG</button>
                  <button onClick={() => downloadPNG(sortedBlack, 'sorted-wordmark-transparent.png', 400, 134)} className="flex-1 px-3 py-2 border border-[#E5E5E5] text-[#0A0A0A] text-sm rounded hover:bg-gray-50">PNG</button>
                </div>
              </div>

              <div className="bg-[#0A0A0A] rounded-xl p-8 shadow-sm">
                <div className="h-32 flex items-center justify-center mb-4">
                  <div dangerouslySetInnerHTML={{ __html: sortedWhite }} className="w-full max-w-[180px]" />
                </div>
                <p className="text-sm text-gray-400 mb-3">Reversed on dark</p>
                <div className="flex gap-2">
                  <button onClick={() => downloadSVG(sortedWhite, 'sorted-wordmark-white.svg')} className="flex-1 px-3 py-2 bg-white text-[#0A0A0A] text-sm rounded hover:bg-gray-100">SVG</button>
                  <button onClick={() => downloadPNG(sortedWhite, 'sorted-wordmark-white.png', 400, 134, '#0A0A0A')} className="flex-1 px-3 py-2 border border-gray-600 text-white text-sm rounded hover:bg-gray-800">PNG</button>
                </div>
              </div>
            </div>
          </div>

          {/* S Mark with Circle (for favicon/app icon) */}
          <div>
            <h3 className="text-xl font-bold text-[#0A0A0A] mb-6">S. with Circle (Favicon/App Icon)</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E5E5E5]">
                <div className="h-32 flex items-center justify-center mb-4">
                  <div dangerouslySetInnerHTML={{ __html: sMarkCircleBlack }} className="w-24 h-24" />
                </div>
                <p className="text-sm text-[#525252] mb-3">Circle variant on light</p>
                <div className="flex gap-2">
                  <button onClick={() => downloadSVG(sMarkCircleBlack, 'sorted-s-circle.svg')} className="flex-1 px-3 py-2 bg-[#0A0A0A] text-white text-sm rounded hover:bg-gray-800">SVG</button>
                  <button onClick={() => downloadPNG(sMarkCircleBlack, 'sorted-s-circle.png', 400, 400)} className="flex-1 px-3 py-2 border border-[#E5E5E5] text-[#0A0A0A] text-sm rounded hover:bg-gray-50">PNG</button>
                </div>
              </div>

              <div className="bg-[#0A0A0A] rounded-xl p-8 shadow-sm">
                <div className="h-32 flex items-center justify-center mb-4">
                  <div dangerouslySetInnerHTML={{ __html: sMarkCircleWhite }} className="w-24 h-24" />
                </div>
                <p className="text-sm text-gray-400 mb-3">Circle reversed on dark</p>
                <div className="flex gap-2">
                  <button onClick={() => downloadSVG(sMarkCircleWhite, 'sorted-s-circle-white.svg')} className="flex-1 px-3 py-2 bg-white text-[#0A0A0A] text-sm rounded hover:bg-gray-100">SVG</button>
                  <button onClick={() => downloadPNG(sMarkCircleWhite, 'sorted-s-circle-white.png', 400, 400, '#0A0A0A')} className="flex-1 px-3 py-2 border border-gray-600 text-white text-sm rounded hover:bg-gray-800">PNG</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Colors Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm font-bold text-[#525252] uppercase tracking-wider">02</span>
            <h2 className="text-3xl font-extrabold text-[#0A0A0A]">Colors</h2>
          </div>

          <p className="text-[#525252] text-lg mb-8 max-w-3xl">
            Our palette is intentionally minimal — near-black for impact, off-white for breathing room, 
            and subtle greys for hierarchy. Use these values precisely for consistency across all media.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {colors.map((color) => (
              <div key={color.name} className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#E5E5E5]">
                <div 
                  className="h-32 w-full"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="p-5">
                  <h4 className="font-bold text-[#0A0A0A] mb-2">{color.name}</h4>
                  <div className="space-y-1">
                    <button 
                      onClick={() => copyToClipboard(color.hex, color.name)}
                      className="flex items-center justify-between w-full text-sm text-[#525252] hover:text-[#0A0A0A] group"
                    >
                      <span>HEX: {color.hex}</span>
                      <span className="text-xs opacity-0 group-hover:opacity-100">
                        {copied === color.name ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                    <p className="text-sm text-[#525252]">RGB: {color.rgb}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm font-bold text-[#525252] uppercase tracking-wider">03</span>
            <h2 className="text-3xl font-extrabold text-[#0A0A0A]">Typography</h2>
          </div>

          <p className="text-[#525252] text-lg mb-8 max-w-3xl">
            We use Plus Jakarta Sans for performance and familiarity. The type hierarchy is bold and direct, 
            with tight tracking for headings and comfortable line-heights for reading.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E5E5E5]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#0A0A0A]">Primary Font</h3>
                <span className="px-3 py-1 bg-[#0A0A0A] text-white text-xs rounded-full">Plus Jakarta Sans</span>
              </div>
              <div className="space-y-4">
                <p className="text-5xl font-black text-[#0A0A0A] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Aa</p>
                <p className="text-[#525252]">'Plus Jakarta Sans', system-ui, -apple-system, sans-serif</p>
                <div className="flex gap-4 text-sm text-[#525252]">
                  <span>Weights: 400, 500, 600, 700, 800</span>
                </div>
                <p className="text-xs text-[#525252]">Google Font — <a href="https://fonts.google.com/specimen/Plus+Jakarta+Sans" className="underline hover:text-[#0A0A0A]">fonts.google.com</a></p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E5E5E5]">
              <h3 className="text-lg font-bold text-[#0A0A0A] mb-6">Type Scale</h3>
              <div className="space-y-4">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-extrabold text-[#0A0A0A] tracking-tight">Hero</span>
                  <span className="text-sm text-[#525252]">48-56px / 800 weight</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="text-2xl font-bold text-[#0A0A0A]">Heading</span>
                  <span className="text-sm text-[#525252]">24-32px / 700-800 weight</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="text-lg font-semibold text-[#0A0A0A]">Subheading</span>
                  <span className="text-sm text-[#525252]">18px / 600 weight</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="text-base text-[#525252]">Body text</span>
                  <span className="text-sm text-[#525252]">16px / 400 weight</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Voice & Tone Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm font-bold text-[#525252] uppercase tracking-wider">04</span>
            <h2 className="text-3xl font-extrabold text-[#0A0A0A]">Voice & Tone</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E5E5E5]">
              <div className="w-12 h-12 bg-[#0A0A0A] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#0A0A0A] mb-2">Direct</h3>
              <p className="text-[#525252]">No fluff. We say what we mean and get to the point quickly.</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E5E5E5]">
              <div className="w-12 h-12 bg-[#0A0A0A] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#0A0A0A] mb-2">Action-oriented</h3>
              <p className="text-[#525252]">We help people get things done. Our language focuses on outcomes.</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E5E5E5]">
              <div className="w-12 h-12 bg-[#0A0A0A] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#0A0A0A] mb-2">Approachable</h3>
              <p className="text-[#525252]">Professional but not stuffy. We speak human to human.</p>
            </div>
          </div>
        </section>

        {/* Usage Rules */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm font-bold text-[#525252] uppercase tracking-wider">05</span>
            <h2 className="text-3xl font-extrabold text-[#0A0A0A]">Usage Rules</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-bold text-green-800">Do</h4>
              </div>
              <ul className="space-y-2 text-green-700">
                <li>• Always include the period in "S." and "Sorted."</li>
                <li>• Use sufficient clear space around logos</li>
                <li>• Use high-contrast combinations for accessibility</li>
                <li>• Keep the wordmark at a readable size</li>
              </ul>
            </div>

            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h4 className="font-bold text-red-800">Don't</h4>
              </div>
              <ul className="space-y-2 text-red-700">
                <li>• Remove the period from the logo</li>
                <li>• Stretch or distort the logo proportions</li>
                <li>• Use low-contrast color combinations</li>
                <li>• Add shadows, outlines, or effects</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Download All */}
        <section className="bg-[#0A0A0A] rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Download Complete Kit</h2>
              <p className="text-gray-400">Get all logo variants, color swatches, and guidelines in one package.</p>
            </div>
            <button 
              onClick={() => {
                downloadSVG(sMarkBlack, 'sorted-s-mark.svg');
                downloadSVG(sortedBlack, 'sorted-wordmark.svg');
                downloadSVG(sMarkCircleBlack, 'sorted-s-circle.svg');
                downloadSVG(sMarkWhite, 'sorted-s-mark-white.svg');
                downloadSVG(sortedWhite, 'sorted-wordmark-white.svg');
                downloadSVG(sMarkCircleWhite, 'sorted-s-circle-white.svg');
              }}
              className="px-6 py-3 bg-white text-[#0A0A0A] font-semibold rounded-lg hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download All SVGs
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] text-white py-12 px-8 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div dangerouslySetInnerHTML={{ __html: sortedWhite }} className="w-24" />
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Sorted. Brand Guidelines.</p>
        </div>
      </footer>
    </div>
  );
}
