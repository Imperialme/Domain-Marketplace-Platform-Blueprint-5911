import { z } from 'zod';
import { getGmailClient } from '../gmailClient.js';
import { accountParam } from './accounts.js';

const messageIdParam = { account: accountParam, messageId: z.string().describe('Gmail message id') };

async function modify(account, messageId, { addLabelIds, removeLabelIds }) {
  const { gmail } = await getGmailClient(account);
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: { addLabelIds, removeLabelIds },
  });
}

export const archiveEmailTool = {
  name: 'archive_email',
  config: {
    title: 'Archive a Gmail message',
    description: 'Removes the message from the inbox (removes the INBOX label). Does not delete it.',
    inputSchema: messageIdParam,
  },
  handler: async ({ account, messageId }) => {
    await modify(account, messageId, { removeLabelIds: ['INBOX'] });
    return { content: [{ type: 'text', text: `Archived message ${messageId}.` }] };
  },
};

export const markEmailReadTool = {
  name: 'mark_email_read',
  config: {
    title: 'Mark a Gmail message as read',
    description: 'Removes the UNREAD label from a message.',
    inputSchema: messageIdParam,
  },
  handler: async ({ account, messageId }) => {
    await modify(account, messageId, { removeLabelIds: ['UNREAD'] });
    return { content: [{ type: 'text', text: `Marked ${messageId} as read.` }] };
  },
};

export const markEmailUnreadTool = {
  name: 'mark_email_unread',
  config: {
    title: 'Mark a Gmail message as unread',
    description: 'Adds the UNREAD label to a message.',
    inputSchema: messageIdParam,
  },
  handler: async ({ account, messageId }) => {
    await modify(account, messageId, { addLabelIds: ['UNREAD'] });
    return { content: [{ type: 'text', text: `Marked ${messageId} as unread.` }] };
  },
};
