interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className = "", size = 28 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox="0 0 120 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Sorted."
    >
      <text
        x="0"
        y="54"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontWeight="800"
        fontSize="64"
        letterSpacing="-2"
        fill="currentColor"
      >
        S.
      </text>
    </svg>
  )
}
