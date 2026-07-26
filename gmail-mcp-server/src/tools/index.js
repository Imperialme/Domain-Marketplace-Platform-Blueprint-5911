import { listAccountsTool } from './accounts.js';
import { searchEmailsTool } from './search.js';
import { readEmailTool } from './read.js';
import { createDraftTool, updateDraftTool } from './draft.js';
import { sendDraftTool } from './send.js';
import { archiveEmailTool, markEmailReadTool, markEmailUnreadTool } from './labels.js';

export const TOOLS = [
  listAccountsTool,
  searchEmailsTool,
  readEmailTool,
  createDraftTool,
  updateDraftTool,
  sendDraftTool,
  archiveEmailTool,
  markEmailReadTool,
  markEmailUnreadTool,
];
