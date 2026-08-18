'use client';

interface IconWrapProps {
  size?: number;
  color: string;
  children: React.ReactNode;
}

const IconWrap = ({ size = 28, color, children }: IconWrapProps) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      border: '3px solid #FFFFFF',
      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    {children}
  </div>
);

export const DepartIcon = ({ size = 28 }: { size?: number }) => (
  <IconWrap size={size} color="#10B981">
    <svg
      width={size * 0.5}
      height={size * 0.5}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  </IconWrap>
);

export const ArriveeIcon = ({ size = 28 }: { size?: number }) => (
  <IconWrap size={size} color="#EF4444">
    <svg
      width={size * 0.5}
      height={size * 0.5}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" fill="#FFFFFF" stroke="none" />
    </svg>
  </IconWrap>
);

export const VoitureIcon = ({ size = 28, color = '#0D9E7E' }: { size?: number; color?: string }) => (
  <IconWrap size={size} color={color}>
    <svg
      width={size * 0.55}
      height={size * 0.55}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h8l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    </svg>
  </IconWrap>
);

export const PassagerIcon = ({ size = 28 }: { size?: number }) => (
  <IconWrap size={size} color="#3B82F6">
    <svg
      width={size * 0.5}
      height={size * 0.5}
      viewBox="0 0 24 24"
      fill="#FFFFFF"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  </IconWrap>
);
