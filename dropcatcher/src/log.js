const ts = () => new Date().toISOString();

/** In-memory ring buffer so the web dashboard can show recent activity. */
export const logBuffer = [];
const MAX_BUFFER = 400;

function push(level, args) {
  const msg = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
  logBuffer.push({ at: ts(), level, msg });
  if (logBuffer.length > MAX_BUFFER) logBuffer.splice(0, logBuffer.length - MAX_BUFFER);
}

export const log = {
  info: (...args) => { push('info', args); console.log(`[${ts()}] INFO `, ...args); },
  warn: (...args) => { push('warn', args); console.warn(`[${ts()}] WARN `, ...args); },
  error: (...args) => { push('error', args); console.error(`[${ts()}] ERROR`, ...args); },
  catch: (...args) => { push('catch', args); console.log(`[${ts()}] CATCH`, ...args); },
};
