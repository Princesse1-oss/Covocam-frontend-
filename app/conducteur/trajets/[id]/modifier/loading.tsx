export default function Loading() {
  return (
    <div style={{ padding: '20px 16px 40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        background: '#FAFAFA', 
        borderRadius: '16px', 
        padding: '32px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        <div style={{ height: '24px', width: '40%', background: '#E5E7EB', borderRadius: '4px', marginBottom: '24px' }} />
        <div style={{ display: 'grid', gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <div style={{ height: '14px', width: '20%', background: '#E5E7EB', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '16px', width: '60%', background: '#E5E7EB', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
