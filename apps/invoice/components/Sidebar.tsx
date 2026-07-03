"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FileText, Users, Settings, Plus } from "lucide-react";

const NAV = [
  { href: "/", label: "Invoices", icon: FileText, exact: true },
  { href: "/clients", label: "Clients", icon: Users, exact: false },
  { href: "/settings", label: "Settings", icon: Settings, exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="no-print w-60 shrink-0 border-r border-black/[0.08] bg-white min-h-screen sticky top-0 hidden md:flex flex-col">
      <div className="px-6 py-6 border-b border-black/[0.06]">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0A0A0A] text-[#FAFAFA]">
            <LayoutGrid size={15} strokeWidth={2.2} />
          </span>
          <span className="font-extrabold tracking-tight text-[#0A0A0A] text-[15px]">
            SortedInvoice
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-[#0A0A0A] text-[#FAFAFA] font-semibold"
                  : "text-[#525252] hover:bg-black/[0.04]"
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <Link
          href="/invoices/new"
          className="flex items-center justify-center gap-2 rounded-lg bg-[#0A0A0A] px-4 py-2.5 text-sm font-semibold text-[#FAFAFA] hover:bg-[#2a2a2a] transition-colors"
        >
          <Plus size={16} strokeWidth={2.4} />
          New invoice
        </Link>
      </div>
    </aside>
  );
}
