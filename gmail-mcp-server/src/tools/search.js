import { z } from 'zod';
import { getGmailClient } from '../gmailClient.js';
import { getHeader } from '../mime.js';
import { accountParam } from './accounts.js';

export const searchEmailsTool = {
  name: 'search_emails',
  config: {
    title: 'Search Gmail',
    description:
      'Searches an account\'s mailbox using Gmail search syntax (e.g. "from:boss@company.com is:unread", "subject:invoice after:2026/01/01"). Returns lightweight summaries; use read_email for full body.',
    inputSchema: {
      account: accountParam,
      query: z.string().describe('Gmail search query, same syntax as the Gmail search box'),
      maxResults: z.number().int().min(1).max(50).optional().describe('Default 10, max 50'),
    },
  },
  handler: async ({ account, query, maxResults }) => {
    const { gmail } = await getGmailClient(account);
    const { data } = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: maxResults ?? 10,
    });

    const messages = data.messages ?? [];
    if (!messages.length) {
      return { content: [{ type: 'text', text: 'No messages matched that query.' }] };
    }

    const summaries = await Promise.all(
      messages.map(async ({ id, threadId }) => {
        const { data: msg } = await gmail.users.messages.get({
          userId: 'me',
          id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        });
        return {
          id,
          threadId,
          from: getHeader(msg.payload, 'From'),
          subject: getHeader(msg.payload, 'Subject') || '(no subject)',
          date: getHeader(msg.payload, 'Date'),
          snippet: msg.snippet,
          unread: msg.labelIds?.includes('UNREAD') ?? false,
        };
      })
    );

    return { content: [{ type: 'text', text: JSON.stringify(summaries, null, 2) }] };
  },
};
