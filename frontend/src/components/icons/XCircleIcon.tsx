type XCircleIconProps = {
  className?: string
}

export function XCircleIcon({ className = 'w-10 h-6' }: XCircleIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 69.39 43.47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="0"
        y="0"
        width="69.39"
        height="43.47"
        rx="21.73"
        ry="21.73"
        className="fill-gray-200 transition-colors group-hover:fill-gray-100"
      />

      <line
        x1="28.78"
        y1="27.65"
        x2="40.61"
        y2="15.82"
        stroke="currentColor"
        strokeWidth="2.61"
        strokeLinecap="round"
        strokeMiterlimit="10"
      />

      <line
        x1="40.61"
        y1="27.65"
        x2="28.78"
        y2="15.82"
        stroke="currentColor"
        strokeWidth="2.61"
        strokeLinecap="round"
        strokeMiterlimit="10"
      />
    </svg>
  )
}