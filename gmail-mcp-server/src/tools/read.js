import { z } from 'zod';
import { getGmailClient } from '../gmailClient.js';
import { extractBody, getHeader } from '../mime.js';
import { accountParam } from './accounts.js';

export const readEmailTool = {
  name: 'read_email',
  config: {
    title: 'Read a Gmail message',
    description: 'Fetches full headers and body text for one message id (from search_emails results).',
    inputSchema: {
      account: accountParam,
      messageId: z.string().describe('Gmail message id'),
    },
  },
  handler: async ({ account, messageId }) => {
    const { gmail } = await getGmailClient(account);
    const { data: msg } = await gmail.users.messages.get({ userId: 'me', id: messageId, format: 'full' });

    const result = {
      id: msg.id,
      threadId: msg.threadId,
      labelIds: msg.labelIds,
      from: getHeader(msg.payload, 'From'),
      to: getHeader(msg.payload, 'To'),
      cc: getHeader(msg.payload, 'Cc'),
      subject: getHeader(msg.payload, 'Subject') || '(no subject)',
      date: getHeader(msg.payload, 'Date'),
      messageIdHeader: getHeader(msg.payload, 'Message-ID'),
      body: extractBody(msg.payload),
    };

    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },
};
