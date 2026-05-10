type CommentIconProps = {
  className?: string
}

export function CommentIcon({ className = 'w-7 h-7' }: CommentIconProps) {
  return (
    <svg
      className={className}
      viewBox="2 2 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M34.2222 17.9926C34.2222 26.2109 27.2567 32.8742 18.6666 32.8742C17.6566 32.8756 16.6494 32.7821 15.6573 32.5959C14.9432 32.4616 14.5861 32.3946 14.3368 32.4327C14.0875 32.4708 13.7343 32.6586 13.0277 33.0344C11.0291 34.0973 8.69856 34.4726 6.45726 34.0558C7.30912 33.0079 7.89092 31.7507 8.14763 30.403C8.30319 29.5786 7.91775 28.7778 7.34047 28.1915C4.71849 25.529 3.11108 21.9412 3.11108 17.9926C3.11108 9.77442 10.0765 3.11108 18.6666 3.11108C27.2567 3.11108 34.2222 9.77442 34.2222 17.9926Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M18.6596 18.6666H18.6736M24.8748 18.6666H24.8888M12.4443 18.6666H12.4583"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}