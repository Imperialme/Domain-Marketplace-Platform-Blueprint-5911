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
  bg:'#C8D3DF', card:'#D8E2ED', raised:'#CFDAE6',
  border:'rgba(0,0,0,0.13)', borderHi:'rgba(0,0,0,0.20)', borderSolid:'#B8C5D6',
  text:'#0F172A', sub:'#1E3050', muted:'#4A5C72', dim:'#7A8FA6',
  green:'#059669', red:'#DC2626', blue:'#2563EB',
  amber:'#D97706', purple:'#7C3AED', cyan:'#0891B2',
  navBg:'rgba(200,211,223,0.97)', inputBg:'#C0CCDA',
  isDark:false,
};

export function getTheme(darkMode) {
  // darkMode: true = DARK, false/undefined = DARK (default dark for space game)
  return darkMode === false ? LIGHT : DARK;
}
