interface GoogleIconProps {
  size?: number;
}

/**
 * The Google "G" mark, kept in its brand colours because it is the only signal
 * users recognise for signing in with a Google account.
 */
export function GoogleIcon({ size = 18 }: GoogleIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className="google-icon"
    >
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-2.8-.4-4H24v7.3h12.1c-.2 2-1.5 5-4.4 7l-.1.3 6.4 5 .4.1c4.1-3.8 6.7-9.4 6.7-15.7Z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.9 0 10.8-1.9 14.4-5.3l-6.8-5.3c-1.9 1.3-4.4 2.2-7.6 2.2-5.7 0-10.6-3.8-12.3-9l-.3.1-6.6 5.1-.1.3C7.8 41.1 15.3 46 24 46Z"
      />
      <path
        fill="#FBBC05"
        d="M11.7 28.6A13.7 13.7 0 0 1 10.9 24c0-1.6.3-3.2.8-4.6v-.4l-6.7-5.2-.2.1A22 22 0 0 0 2 24c0 3.6.9 7 2.4 9.9l7.3-5.3Z"
      />
      <path
        fill="#EA4335"
        d="M24 10.2c4 0 6.8 1.7 8.3 3.2l6-5.9C34.7 4.1 29.9 2 24 2 15.3 2 7.8 6.9 4.4 14.1l7.3 5.3C13.4 14 18.3 10.2 24 10.2Z"
      />
    </svg>
  );
}
