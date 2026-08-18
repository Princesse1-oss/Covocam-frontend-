'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface NotificationData {
  id: number;
  titre: string;
  message: string;
  type: string;
  estLu: boolean;
  dateEnvoi: string;
  url?: string | null;
  icone?: string | null;
  couleur?: string | null;
  reservationId?: number;
}

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const formatDateTime = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const handlePayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.reservationId) return;
    setProcessing(true);
    router.push(`/passager/paiement/${notification.reservationId}`);
  };

  const handleClick = () => {
    if (!notification.estLu) {
      onMarkAsRead(notification.id);
    }
    if (notification.url) {
      router.push(notification.url);
    }
  };

  const getIconAndColor = () => {
    switch (notification.type) {
      case 'acceptation': return { icon: 'checkCircle', color: '#16a34a', bgColor: '#f0fdf4' };
      case 'paiement': return { icon: 'money', color: '#16a34a', bgColor: '#f0fdf4' };
      case 'remboursement': return { icon: 'refund', color: '#16a34a', bgColor: '#f0fdf4' };
      case 'annulation': return { icon: 'xCircle', color: '#dc2626', bgColor: '#fef2f2' };
      case 'reservation': return { icon: 'document', color: '#f97316', bgColor: '#fff7ed' };
      default: return { icon: notification.icone || 'bell', color: '#6b7280', bgColor: '#fff' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  const renderIcon = (name: string, size = 16, c?: string) => {
    const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
    const icons: Record<string, React.ReactNode> = {
      checkCircle: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c||color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
      money: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c||color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      refund: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c||color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>,
      xCircle: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c||color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
      document: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c||color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
      bell: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c||color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
      creditCard: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c||color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    };
    return icons[name] || icons.bell;
  };

  return (
    <div 
      onClick={handleClick}
      style={{
        background: notification.estLu ? '#fff' : bgColor,
        borderRadius: '12px',
        padding: '16px 20px',
        border: `1px solid ${notification.estLu ? '#e5e7eb' : color + '40'}`,
        transition: 'box-shadow 0.2s, background 0.2s',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
          background: notification.estLu ? '#f3f4f6' : `linear-gradient(135deg, ${color}, ${color}dd)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {renderIcon(icon, 18, notification.estLu ? '#9ca3af' : '#fff')}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', fontWeight: notification.estLu ? '600' : '700', color: '#111827' }}>
              {notification.titre}
            </span>
            {!notification.estLu && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
            )}
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px', lineHeight: '1.5' }}>
            {notification.message}
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', color: '#9ca3af', flexWrap: 'wrap', alignItems: 'center' }}>
            <span>{formatDateTime(notification.dateEnvoi)}</span>
            {notification.estLu && <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Lu</span>}
            
            {notification.type === 'acceptation' && notification.reservationId && (
              <button
                onClick={handlePayer}
                disabled={processing}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', marginTop: '4px',
                  background: processing ? '#d1d5db' : 'linear-gradient(135deg, #16a34a, #22c55e)',
                  border: 'none', borderRadius: '6px',
                  color: '#fff', fontSize: '12px', fontWeight: '700',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(34,197,94,0.3)',
                }}
              >
                {processing ? '...' : <><span style={{display:'inline-flex',verticalAlign:'middle'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></span> Payer ma place</>}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0, alignItems: 'flex-end' }}>
        {!notification.estLu && (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.id); }}
            style={{ padding: '4px 12px', background: 'transparent', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
          >
            Marquer lu
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
            style={{ padding: '4px 12px', background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}