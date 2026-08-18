'use client';

interface LegendeItem {
  label: string;
  svg: React.ReactNode;
}

interface LegendeCarteProps {
  items: LegendeItem[];
  darkMode?: boolean;
}

export default function LegendeCarte({ items, darkMode = false }: LegendeCarteProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        padding: '14px 16px',
        background: darkMode ? '#1A1A1A' : '#FFFFFF',
        borderTop: `1px solid ${darkMode ? '#2A2A2A' : '#EBEBEB'}`,
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: darkMode ? '#9CA3AF' : '#6B7280',
          }}
        >
          {item.svg}
          <span style={{ fontWeight: '600' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
