type IconProps = {
  className?: string
}

export function ProfileIcon({ className = 'w-7 h-7' }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 25 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.342 20.9736C6.08949 20.9736 0.75 21.919 0.75 25.705C0.75 29.491 6.05562 30.4702 12.342 30.4702C18.5945 30.4702 23.9324 29.5233 23.9324 25.7388C23.9324 21.9544 18.6284 20.9736 12.342 20.9736Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.342 15.5735C16.4452 15.5735 19.7708 12.2463 19.7708 8.14315C19.7708 4.03999 16.4452 0.714355 12.342 0.714355C8.23884 0.714355 4.91166 4.03999 4.91166 8.14315C4.89781 12.2324 8.20189 15.5596 12.2896 15.5735H12.342Z"
        stroke="currentColor"
        strokeWidth="1.42857"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}