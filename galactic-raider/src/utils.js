export const fm = n => {
  const a = Math.abs(n);
  return (n < 0 ? '-' : '') + (
    a >= 1e12 ? '$' + (a / 1e12).toFixed(2) + 'T' :
    a >= 1e9  ? '$' + (a / 1e9).toFixed(2)  + 'B' :
    a >= 1e6  ? '$' + (a / 1e6).toFixed(2)  + 'M' :
    a >= 1e3  ? '$' + (a / 1e3).toFixed(1)  + 'K' :
    '$' + a.toFixed(2)
  );
};

export const pc = n => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
export const cl = (v, a, b) => Math.min(Math.max(v, a), b);
export const r2 = n => Math.round(n * 100) / 100;

export const C = {
  bg: '#0F172A', card: '#1E293B', border: '#334155', hover: '#2D3748',
  text: '#F8FAFC', dim: '#94A3B8', muted: '#64748B',
  green: '#16A34A', greenBg: '#14532D', greenText: '#86EFAC',
  red: '#DC2626', redBg: '#7F1D1D', redText: '#FCA5A5',
  blue: '#1D4ED8', blueBg: '#1E3A8A', blueText: '#93C5FD',
  amber: '#D97706', amberBg: '#78350F', amberText: '#FDE68A',
  purple: '#7C3AED', purpleBg: '#312E81', purpleText: '#A5B4FC',
  slate: '#64748B',
};
