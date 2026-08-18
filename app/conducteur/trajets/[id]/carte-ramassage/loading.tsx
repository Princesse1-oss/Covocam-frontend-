export default function Loading() {
  return (
    <div style={{ padding: '20px 16px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        background: '#FAFAFA', 
        borderRadius: '16px', 
        padding: '24px',
        animation: 'pulse 1.5s ease-in-out infinite',
        marginBottom: '24px'
      }}>
        <div style={{ height: '400px', width: '100%', background: '#E5E7EB', borderRadius: '12px' }} />
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
