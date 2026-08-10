import type { Metadata } from "next"
import Script from "next/script"
import localFont from "next/font/local"
import "./globals.css"

const signature = localFont({
  src: "../public/fonts/Fave-ScriptPro.ttf",
  variable: "--font-signature",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://sortmydigital.site"),
  title: "Sorted | Your new website, Sorted",
  description:
    "Sorted designs websites before you spend a penny, then builds them if you love what you see.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Sorted | Your new website, Sorted",
    description:
      "See your new website first. Then decide.",
    locale: "en_GB",
    url: "https://sortmydigital.site",
    siteName: "Sorted",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB" className={signature.variable}>
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-ND877LCK');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-ND877LCK"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <div className="scroll-progress" />
        {children}
      </body>
    </html>
  )
}
