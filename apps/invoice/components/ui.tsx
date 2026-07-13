import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  label,
  title,
  action,
}: {
  label?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-10">
      <div>
        {label && (
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">
            {label}
          </p>
        )}
        <h1 className="font-extrabold tracking-tight text-[#0A0A0A] text-3xl sm:text-4xl">
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}

export function Container({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-6 sm:px-10 py-10 sm:py-14 animate-fade-in">
      {children}
    </div>
  );
}

export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg bg-[#0A0A0A] px-5 py-2.5 text-sm font-semibold text-[#FAFAFA] hover:bg-[#2a2a2a] transition-colors"
    >
      {children}
    </Link>
  );
}

export function GhostLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg border border-black/[0.12] px-5 py-2.5 text-sm font-medium text-[#525252] hover:bg-black/[0.02] transition-colors"
    >
      {children}
    </Link>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.12] bg-white px-6 py-20 text-center">
      <p className="font-semibold text-[#0A0A0A]">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-[#737373]">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-black/[0.12] bg-white px-3.5 py-2.5 text-sm text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-black/[0.3] transition-colors";

export const labelClass =
  "block font-mono text-[11px] uppercase tracking-[0.12em] text-[#737373] mb-1.5";
