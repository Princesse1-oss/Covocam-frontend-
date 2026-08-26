'use client';

import { useTheme } from '@/app/lib/ThemeContext';

interface TrajetCardProps {
  trajet: any;
  onDetail?: () => void;
  onModifier?: () => void;
  onAnnuler?: () => void;
}

const Icon = ({ name, size = 16, color = '#374151' }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    eye: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    edit: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    x: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

export default function TrajetCard({ trajet, onDetail, onModifier, onAnnuler }: TrajetCardProps) {
  const { t, lang } = useTheme();
  return (
    <div style={{ background: '#fff', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
      <p>{trajet.ville_depart} ({trajet.lieu_depart}) &rarr; {trajet.ville_arrivee} ({trajet.lieu_arrivee})</p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button onClick={onDetail} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="eye" /> Detail</button>
        <button onClick={onModifier} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="edit" /> {t('edit')}</button>
        <button onClick={onAnnuler} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626' }}><Icon name="x" color="#dc2626" /> {t('cancel')}</button>
      </div>
    </div>
  );
}
