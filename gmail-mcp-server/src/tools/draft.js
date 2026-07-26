import { z } from 'zod';
import { getGmailClient } from '../gmailClient.js';
import { buildRawMessage } from '../mime.js';
import { accountParam } from './accounts.js';

const draftFields = {
  to: z.union([z.string(), z.array(z.string())]).describe('Recipient(s)'),
  subject: z.string(),
  body: z.string().describe('Plain-text body'),
  cc: z.union([z.string(), z.array(z.string())]).optional(),
  bcc: z.union([z.string(), z.array(z.string())]).optional(),
  threadId: z.string().optional().describe('Set when replying, to keep the draft in the existing thread'),
  inReplyTo: z.string().optional().describe('Message-ID header of the message being replied to'),
  references: z.string().optional().describe('References header, typically the same as inReplyTo for a simple reply'),
};

export const createDraftTool = {
  name: 'create_draft',
  config: {
    title: 'Create a Gmail draft',
    description:
      'Creates a draft (new message or reply). Nothing is sent — the user reviews it in Gmail or via send_draft. This is the required first step before any send.',
    inputSchema: { account: accountParam, ...draftFields },
  },
  handler: async ({ account, to, subject, body, cc, bcc, threadId, inReplyTo, references }) => {
    const { gmail } = await getGmailClient(account);
    const raw = buildRawMessage({ to, subject, body, cc, bcc, inReplyTo, references });

    const { data } = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: { message: { raw, threadId } },
    });

    return {
      content: [
        {
          type: 'text',
          text: `Draft created (not sent). draftId=${data.id}, messageId=${data.message?.id}, threadId=${data.message?.threadId}. Review it, then call send_draft with confirm=true to send.`,
        },
      ],
    };
  },
};

export const updateDraftTool = {
  name: 'update_draft',
  config: {
    title: 'Update a Gmail draft',
    description:
      'Replaces the content of an existing draft (e.g. after revising wording). Provide the full message again — this is not a partial patch.',
    inputSchema: { account: accountParam, draftId: z.string(), ...draftFields },
  },
  handler: async ({ account, draftId, to, subject, body, cc, bcc, threadId, inReplyTo, references }) => {
    const { gmail } = await getGmailClient(account);
    const raw = buildRawMessage({ to, subject, body, cc, bcc, inReplyTo, references });

    const { data } = await gmail.users.drafts.update({
      userId: 'me',
      id: draftId,
      requestBody: { message: { raw, threadId } },
    });

    return {
      content: [{ type: 'text', text: `Draft ${data.id} updated (still not sent).` }],
    };
  },
};
