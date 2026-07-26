import { z } from 'zod';
import { listAccounts } from '../store.js';

export const listAccountsTool = {
  name: 'list_accounts',
  config: {
    title: 'List Gmail accounts',
    description:
      'Lists the Gmail accounts configured on this machine (id, email, label). Every other tool takes an "account" parameter — use the id or email shown here.',
    inputSchema: {},
  },
  handler: async () => {
    const accounts = listAccounts();
    if (!accounts.length) {
      return {
        content: [
          {
            type: 'text',
            text: 'No Gmail accounts are configured yet. Run `gmail-mcp add-account` in a terminal on this machine first.',
          },
        ],
      };
    }
    const lines = accounts.map((a) => `- ${a.id}: ${a.email}${a.label ? ` (${a.label})` : ''}`);
    return { content: [{ type: 'text', text: lines.join('\n') }] };
  },
};

export const accountParam = z.string().describe('Account id or email address, from list_accounts');
