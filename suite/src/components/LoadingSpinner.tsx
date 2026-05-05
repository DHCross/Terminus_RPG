import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export function LoadingSpinner({ size = 'medium', text }: LoadingSpinnerProps) {
  const sizeMap = {
    small: { width: '16px', height: '16px', borderWidth: '2px' },
    medium: { width: '32px', height: '32px', borderWidth: '3px' },
    large: { width: '48px', height: '48px', borderWidth: '4px' },
  };

  const { width, height, borderWidth } = sizeMap[size];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      padding: '2rem',
    }}>
      <div
        style={{
          width,
          height,
          border: `${borderWidth} solid #334155`,
          borderTop: `${borderWidth} solid #3b82f6`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      {text && <p style={{ color: '#94a3b8', margin: 0 }}>{text}</p>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}