import { TopNav } from "./components/TopNav"
import "./ads.css"

export const metadata = {
  title: "Sorted Ads | Campaign workspace",
  description: "Campaign creation, collaboration, approval and publishing.",
  robots: { index: false, follow: false },
}

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ads-app">
      <TopNav />
      <main className="ads-main">
        {children}
      </main>
    </div>
  )
}
