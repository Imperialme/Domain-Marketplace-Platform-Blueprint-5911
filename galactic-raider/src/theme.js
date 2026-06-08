export const DARK = {
  bg:'#030810', card:'#0A1628', raised:'#0F1E35',
  border:'rgba(255,255,255,0.08)', borderHi:'rgba(255,255,255,0.14)', borderSolid:'#1A2744',
  text:'#F1F5F9', sub:'#94A3B8', muted:'#475569', dim:'#4B5563',
  green:'#10B981', red:'#F43F5E', blue:'#3B82F6',
  amber:'#F59E0B', purple:'#8B5CF6', cyan:'#06B6D4',
  navBg:'rgba(3,8,16,0.97)', inputBg:'#060B14',
  isDark:true,
};

export const LIGHT = {
  bg:'#F0F4F8', card:'#FFFFFF', raised:'#F8FAFC',
  border:'rgba(0,0,0,0.08)', borderHi:'rgba(0,0,0,0.14)', borderSolid:'#E2E8F0',
  text:'#0F172A', sub:'#334155', muted:'#64748B', dim:'#94A3B8',
  green:'#059669', red:'#DC2626', blue:'#2563EB',
  amber:'#D97706', purple:'#7C3AED', cyan:'#0891B2',
  navBg:'rgba(240,244,248,0.97)', inputBg:'#F8FAFC',
  isDark:false,
};

export function getTheme(darkMode) {
  // darkMode: true = DARK, false/undefined = DARK (default dark for space game)
  return darkMode === false ? LIGHT : DARK;
}
