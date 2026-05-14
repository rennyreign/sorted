'use client';

export default function LogoExport() {
  const downloadPNG = (svgContent: string, filename: string, width: number, height: number, bgColor?: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    const svgBlob = new Blob([svgContent], {type: 'image/svg+xml;charset=utf-8'});
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

  const sLogoBlack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="75" font-family="system-ui, -apple-system, sans-serif" font-size="70" font-weight="900" fill="#0A0A0A" text-anchor="middle">S.</text></svg>`;
  
  const sLogoWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="75" font-family="system-ui, -apple-system, sans-serif" font-size="70" font-weight="900" fill="#FFFFFF" text-anchor="middle">S.</text></svg>`;
  
  const fullLogoBlack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><text x="0" y="32" font-family="system-ui,-apple-system,sans-serif" font-size="32" font-weight="800" fill="#0A0A0A" letter-spacing="-0.02em">Sorted.</text></svg>`;
  
  const fullLogoWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><text x="0" y="32" font-family="system-ui,-apple-system,sans-serif" font-size="32" font-weight="800" fill="#FFFFFF" letter-spacing="-0.02em">Sorted.</text></svg>`;

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-10 font-sans">
      <h1 className="text-2xl font-bold mb-2">Sorted Logo Export</h1>
      <p className="text-gray-600 mb-8">Click download to save high-res PNG files</p>
      
      {/* S Mark Section */}
      <h2 className="text-sm font-semibold text-gray-500 mb-4">S Mark Logo</h2>
      <div className="grid grid-cols-3 gap-6 mb-10">
        {/* White */}
        <div>
          <div className="w-full h-64 bg-white rounded-lg shadow flex items-center justify-center">
            <div dangerouslySetInnerHTML={{ __html: sLogoBlack }} className="w-48 h-48" />
          </div>
          <button 
            onClick={() => downloadPNG(sLogoBlack, 'logo-s-white-bg.png', 400, 300, '#FFFFFF')}
            className="mt-3 px-4 py-2 bg-[#0A0A0A] text-white text-sm rounded hover:bg-gray-800"
          >
            Download (white bg)
          </button>
        </div>
        
        {/* Transparent */}
        <div>
          <div className="w-full h-64 rounded-lg shadow flex items-center justify-center" 
               style={{background: 'repeating-conic-gradient(#e5e5e5 0% 25%, #fff 0% 50%) 50% / 20px 20px'}}>
            <div dangerouslySetInnerHTML={{ __html: sLogoBlack }} className="w-48 h-48" />
          </div>
          <button 
            onClick={() => downloadPNG(sLogoBlack, 'logo-s-transparent.png', 400, 300)}
            className="mt-3 px-4 py-2 bg-[#0A0A0A] text-white text-sm rounded hover:bg-gray-800"
          >
            Download (transparent)
          </button>
        </div>
        
        {/* Black */}
        <div>
          <div className="w-full h-64 bg-[#0A0A0A] rounded-lg shadow flex items-center justify-center">
            <div dangerouslySetInnerHTML={{ __html: sLogoWhite }} className="w-48 h-48" />
          </div>
          <button 
            onClick={() => downloadPNG(sLogoWhite, 'logo-s-black-bg.png', 400, 300, '#0A0A0A')}
            className="mt-3 px-4 py-2 bg-[#0A0A0A] text-white text-sm rounded hover:bg-gray-800"
          >
            Download (black bg)
          </button>
        </div>
      </div>

      {/* Full Logo Section */}
      <h2 className="text-sm font-semibold text-gray-500 mb-4">Full Logo (sorted.)</h2>
      <div className="grid grid-cols-3 gap-6">
        {/* White */}
        <div>
          <div className="w-full h-64 bg-white rounded-lg shadow flex items-center justify-center p-6">
            <div dangerouslySetInnerHTML={{ __html: fullLogoBlack }} className="w-full" />
          </div>
          <button 
            onClick={() => downloadPNG(fullLogoBlack, 'logo-full-white-bg.png', 400, 180, '#FFFFFF')}
            className="mt-3 px-4 py-2 bg-[#0A0A0A] text-white text-sm rounded hover:bg-gray-800"
          >
            Download (white bg)
          </button>
        </div>
        
        {/* Transparent */}
        <div>
          <div className="w-full h-64 rounded-lg shadow flex items-center justify-center p-6" 
               style={{background: 'repeating-conic-gradient(#e5e5e5 0% 25%, #fff 0% 50%) 50% / 20px 20px'}}>
            <div dangerouslySetInnerHTML={{ __html: fullLogoBlack }} className="w-full" />
          </div>
          <button 
            onClick={() => downloadPNG(fullLogoBlack, 'logo-full-transparent.png', 400, 180)}
            className="mt-3 px-4 py-2 bg-[#0A0A0A] text-white text-sm rounded hover:bg-gray-800"
          >
            Download (transparent)
          </button>
        </div>
        
        {/* Black */}
        <div>
          <div className="w-full h-64 bg-[#0A0A0A] rounded-lg shadow flex items-center justify-center p-6">
            <div dangerouslySetInnerHTML={{ __html: fullLogoWhite }} className="w-full" />
          </div>
          <button 
            onClick={() => downloadPNG(fullLogoWhite, 'logo-full-black-bg.png', 400, 180, '#0A0A0A')}
            className="mt-3 px-4 py-2 bg-[#0A0A0A] text-white text-sm rounded hover:bg-gray-800"
          >
            Download (black bg)
          </button>
        </div>
      </div>
    </div>
  );
}
