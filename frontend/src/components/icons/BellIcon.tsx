type BellIconProps = {
  className?: string
}

export function BellIcon({ className = 'w-6 h-7' }: BellIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9342 21.6022C19.3543 21.6022 22.7869 20.6503 23.1184 16.8296C23.1184 13.0116 20.7252 13.2571 20.7252 8.57251C20.7252 4.91334 17.2569 0.75 11.9342 0.75C6.61154 0.75 3.14322 4.91334 3.14322 8.57251C3.14322 13.2571 0.75 13.0116 0.75 16.8296C1.08283 20.6647 4.51549 21.6022 11.9342 21.6022Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.0774 25.5621C13.2825 27.5552 10.4825 27.5788 8.67041 25.5621"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}