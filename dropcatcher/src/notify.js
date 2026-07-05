import { log } from './log.js';

/**
 * Fire-and-forget notifications. Supports any generic JSON webhook
 * (Discord/Slack-compatible payload) and Telegram bots. Failures are logged
 * but never interrupt monitoring or catching.
 */
export async function notify(cfg, title, message) {
  const text = `🌐 dropcatcher — ${title}\n${message}`;
  log.info(`NOTIFY: ${title} — ${message}`);
  const jobs = [];

  const webhookUrl = cfg?.notify?.webhookUrl;
  if (webhookUrl) {
    jobs.push(
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, text }),
        signal: AbortSignal.timeout(10000),
      })
    );
  }

  const tg = cfg?.notify?.telegram;
  if (tg?.botToken && tg?.chatId) {
    jobs.push(
      fetch(`https://api.telegram.org/bot${tg.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tg.chatId, text }),
        signal: AbortSignal.timeout(10000),
      })
    );
  }

  const results = await Promise.allSettled(jobs);
  for (const r of results) {
    if (r.status === 'rejected') log.warn(`notification failed: ${r.reason}`);
  }
}
