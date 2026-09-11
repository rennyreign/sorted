import { Sidebar } from "./components/Sidebar"
import { Topbar } from "./components/Topbar"
import "./ads.css"

export const metadata = {
  title: "Sorted Ads | Campaign workspace",
  description: "Campaign creation, collaboration, approval and publishing.",
  robots: { index: false, follow: false },
}

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ads-app">
      <Sidebar />
      <div className="ads-main">
        <Topbar />
        {children}
        <footer className="ads-footer">
          <span className="brand">Sorted.</span>
          <span>Small businesses. A more sorted future.</span>
        </footer>
      </div>
    </div>
  )
}
