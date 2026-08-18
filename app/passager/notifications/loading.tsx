export default function Loading() {
  return (
    <div style={{ padding: '20px 16px 40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gap: '12px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ 
            background: '#FAFAFA', 
            borderRadius: '12px', 
            padding: '16px',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`
          }}>
            <div style={{ height: '16px', width: '70%', background: '#E5E7EB', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ height: '14px', width: '50%', background: '#E5E7EB', borderRadius: '4px' }} />
          </div>
        ))}
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
