import { z } from 'zod';
import { getGmailClient } from '../gmailClient.js';
import { accountParam } from './accounts.js';

export const sendDraftTool = {
  name: 'send_draft',
  config: {
    title: 'Send a Gmail draft',
    description:
      'Sends a previously created draft. There is no tool to send email directly — every send goes through create_draft first, and this call requires confirm=true as an explicit safety check. Show the user the draft content and get their go-ahead before calling this with confirm=true.',
    inputSchema: {
      account: accountParam,
      draftId: z.string().describe('Draft id returned by create_draft'),
      confirm: z
        .boolean()
        .describe('Must be true. Set to true only after the user has explicitly approved sending this exact draft.'),
    },
  },
  handler: async ({ account, draftId, confirm }) => {
    if (!confirm) {
      return {
        content: [
          {
            type: 'text',
            text: 'Not sent. Set confirm=true only after the user has explicitly approved sending this draft.',
          },
        ],
        isError: true,
      };
    }

    const { gmail } = await getGmailClient(account);
    const { data } = await gmail.users.drafts.send({ userId: 'me', requestBody: { id: draftId } });

    return { content: [{ type: 'text', text: `Sent. messageId=${data.id}, threadId=${data.threadId}` }] };
  },
};
