interface DemandeCardProps {
  demande: any;
  onAccepter?: () => void;
  onRefuser?: () => void;
}

const Icon = ({ name, size = 16, color = '#fff' }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

export default function DemandeCard({ demande, onAccepter, onRefuser }: DemandeCardProps) {
  return (
    <div style={{ background: '#fff', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
      <p>Demande de {demande.passager_nom}</p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button onClick={onAccepter} style={{ background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="check" /> Accepter</button>
        <button onClick={onRefuser} style={{ background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="x" /> Refuser</button>
      </div>
    </div>
  );
}
