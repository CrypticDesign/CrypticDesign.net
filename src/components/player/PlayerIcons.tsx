/**
 * Transport and tool glyphs for the Cryptic Signal player.
 * Inline SVG so the icons inherit `currentColor` and stay crisp on the
 * dark HUD without shipping an icon dependency.
 */

type IconProps = { size?: number };

function Svg({ size = 19, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function QueueIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 4.6h10M7 10h10M7 15.4h10" />
      <rect x="2.6" y="3.7" width="1.9" height="1.9" fill="currentColor" stroke="none" />
      <rect x="2.6" y="9.1" width="1.9" height="1.9" fill="currentColor" stroke="none" />
      <rect x="2.6" y="14.5" width="1.9" height="1.9" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <Svg size={20} {...props}>
      <path d="M3.2 7.4h2.9L10 4.1v11.8L6.1 12.6H3.2z" fill="currentColor" stroke="none" />
      <path d="M12.7 7.3a3.7 3.7 0 0 1 0 5.4" />
      <path d="M15.1 5.1a7 7 0 0 1 0 9.8" />
    </Svg>
  );
}

export function MuteIcon(props: IconProps) {
  return (
    <Svg size={20} {...props}>
      <path d="M3.2 7.4h2.9L10 4.1v11.8L6.1 12.6H3.2z" fill="currentColor" stroke="none" />
      <path d="M13 7.8l4.2 4.4M17.2 7.8L13 12.2" />
    </Svg>
  );
}

/** Diagonal arrows, matching the mockup's expand/collapse mark. */
export function CollapseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11.8 8.2l5-5M12.6 3.2h4.2v4.2" />
      <path d="M8.2 11.8l-5 5M7.4 16.8H3.2v-4.2" />
    </Svg>
  );
}

export function ShuffleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.6 5.4h2.7a3 3 0 0 1 2.5 1.35l3.3 4.9a3 3 0 0 0 2.5 1.35H17" />
      <path d="M2.6 14.6h2.7a3 3 0 0 0 2.5-1.35l.55-.8" />
      <path d="M11.6 7.5l.6-.85A3 3 0 0 1 14.7 5.4H17" />
      <path d="M15.1 3.5L17 5.4l-1.9 1.9M15.1 11.4L17 13.3l-1.9 1.9" />
    </Svg>
  );
}

export function PreviousIcon(props: IconProps) {
  return (
    <Svg size={22} {...props}>
      <rect x="4.2" y="4.2" width="2" height="11.6" rx="0.5" fill="currentColor" stroke="none" />
      <path d="M16.2 4.6L7.9 10l8.3 5.4z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function NextIcon(props: IconProps) {
  return (
    <Svg size={22} {...props}>
      <rect x="13.8" y="4.2" width="2" height="11.6" rx="0.5" fill="currentColor" stroke="none" />
      <path d="M3.8 4.6L12.1 10l-8.3 5.4z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <Svg size={24} {...props}>
      <path d="M7.2 4.4l9.2 5.6-9.2 5.6z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <Svg size={24} {...props}>
      <rect x="6.4" y="4.2" width="2.8" height="11.6" rx="1" fill="currentColor" stroke="none" />
      <rect x="10.8" y="4.2" width="2.8" height="11.6" rx="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function RepeatIcon({ one = false, ...props }: IconProps & { one?: boolean }) {
  return (
    <Svg {...props}>
      <path d="M3.8 9.4V8.2A2.7 2.7 0 0 1 6.5 5.5h8.4" />
      <path d="M12.8 3.4l2.1 2.1-2.1 2.1" />
      <path d="M16.2 10.6v1.2a2.7 2.7 0 0 1-2.7 2.7H5.1" />
      <path d="M7.2 16.6l-2.1-2.1 2.1-2.1" />
      {one ? <path d="M9.2 8.7h1.3v3.2M9.4 11.9h2.5" strokeWidth={1.4} /> : null}
    </Svg>
  );
}
