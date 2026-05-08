type UnknownProfileAvatarProps = {
  className?: string
}

export function UnknownProfileAvatar({
  className = 'w-24 h-24',
}: UnknownProfileAvatarProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 670.32 670.32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="335.16" cy="335.16" r="335.16" fill="#f1f1f1" />

      <ellipse
        cx="335.16"
        cy="198.84"
        rx="120.17"
        ry="120.19"
        fill="#babec0"
      />

      <path
        d="M576.53,562.4c-.47-68.68-26.96-136.18-74.23-186.54-19.58-20.86-42.47-37.38-68.1-49.46-8.44-3.98-16.99-2.61-21.92,5.66-15.32,25.73-41.91,42.02-72.12,43.66-32.94,1.79-64.07-14.07-81.09-42.29-5.34-8.86-13.45-11.6-23.13-7-25.46,12.12-48.49,28.62-67.99,49.47-47.17,50.42-73.7,117.81-74.17,186.47v5.3c60.97,63.27,146.57,102.65,241.37,102.65s180.41-39.37,241.37-102.65v-5.27Z"
        fill="#babec0"
      />
    </svg>
  )
}