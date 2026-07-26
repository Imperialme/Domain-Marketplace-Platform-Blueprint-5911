function encodeHeaderValue(value) {
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
}

function toBase64Url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function joinAddresses(value) {
  if (!value) return undefined;
  return Array.isArray(value) ? value.join(', ') : value;
}

/** Builds a base64url-encoded RFC 2822 message, ready for Gmail API's `raw` field. */
export function buildRawMessage({ from, to, cc, bcc, subject, body, inReplyTo, references }) {
  const headers = [];
  if (from) headers.push(`From: ${from}`);
  headers.push(`To: ${joinAddresses(to)}`);
  const ccValue = joinAddresses(cc);
  if (ccValue) headers.push(`Cc: ${ccValue}`);
  const bccValue = joinAddresses(bcc);
  if (bccValue) headers.push(`Bcc: ${bccValue}`);
  headers.push(`Subject: ${encodeHeaderValue(subject || '')}`);
  if (inReplyTo) headers.push(`In-Reply-To: ${inReplyTo}`);
  if (references) headers.push(`References: ${references}`);
  headers.push('MIME-Version: 1.0');
  headers.push('Content-Type: text/plain; charset="UTF-8"');
  headers.push('Content-Transfer-Encoding: base64');

  const bodyBase64 = Buffer.from(body || '', 'utf8')
    .toString('base64')
    .replace(/.{76}/g, '$&\r\n');

  const message = `${headers.join('\r\n')}\r\n\r\n${bodyBase64}`;
  return toBase64Url(Buffer.from(message, 'utf8'));
}

function decodePart(part) {
  if (!part?.body?.data) return '';
  return Buffer.from(part.body.data, 'base64').toString('utf8');
}

function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

/** Walks a Gmail message payload and returns the best-effort plain-text body. */
export function extractBody(payload) {
  if (!payload) return '';

  if (payload.parts?.length) {
    const plain = payload.parts.find((p) => p.mimeType === 'text/plain');
    if (plain) return decodePart(plain);

    for (const part of payload.parts) {
      if (part.parts) {
        const nested = extractBody(part);
        if (nested) return nested;
      }
    }

    const html = payload.parts.find((p) => p.mimeType === 'text/html');
    if (html) return stripHtml(decodePart(html));

    return '';
  }

  if (payload.mimeType === 'text/html') return stripHtml(decodePart(payload));
  return decodePart(payload);
}

export function getHeader(payload, name) {
  return payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value;
}
