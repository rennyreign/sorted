"use client"

import { useEffect, useRef, type ReactNode } from "react"

// Native <dialog> primitive for client-site overlays (menus, quote
// forms, lightboxes). Gives keyboard dismissal, focus containment
// and focus restoration for free — do not reimplement per build.
//
// Usage:
//   const [open, setOpen] = useState(false)
//   <Dialog open={open} onClose={() => setOpen(false)} label="…">
//     …
//   </Dialog>

interface DialogProps {
  open: boolean
  onClose: () => void
  label: string
  className?: string
  children: ReactNode
}

export default function Dialog({ open, onClose, label, className, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null
      el.showModal()
    } else if (!open && el.open) {
      el.close()
      returnFocusRef.current?.focus()
      returnFocusRef.current = null
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-label={label}
      className={className}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes.
        if (e.target === ref.current) onClose()
      }}
    >
      {children}
    </dialog>
  )
}
