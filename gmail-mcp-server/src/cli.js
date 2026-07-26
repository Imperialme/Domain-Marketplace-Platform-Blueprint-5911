import { Command } from 'commander';
import readline from 'node:readline/promises';
import {
  setOAuthClientCredentials,
  listAccounts,
  requireAccount,
  upsertAccountMeta,
  removeAccountMeta,
  saveTokens,
  deleteTokens,
} from './store.js';
import { runLoopbackAuthFlow, createOAuth2Client } from './oauth.js';
import { getUserProfile } from './gmailClient.js';

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

function slugify(email) {
  return email.toLowerCase().replace(/@.*/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const program = new Command();
program.name('gmail-mcp').description('CLI for the Gmail MCP multi-account server');

program
  .command('init')
  .description('Store your Google OAuth Desktop client id/secret (from Google Cloud Console)')
  .option('--client-id <id>', 'OAuth client id')
  .option('--client-secret <secret>', 'OAuth client secret')
  .action(async (opts) => {
    const clientId = opts.clientId || (await prompt('Google OAuth Client ID: '));
    const clientSecret = opts.clientSecret || (await prompt('Google OAuth Client Secret: '));
    if (!clientId || !clientSecret) {
      console.error('Both a client id and client secret are required.');
      process.exitCode = 1;
      return;
    }
    setOAuthClientCredentials(clientId, clientSecret);
    console.log('Saved. Next, run: gmail-mcp add-account --label "Personal"');
  });

program
  .command('add-account')
  .description('Authorize a Gmail account via your browser and store its encrypted tokens')
  .option('--label <label>', 'Friendly label, e.g. "Imperial MEA" or "Personal"')
  .option('--id <id>', 'Custom account id (defaults to a slug of the email)')
  .action(async (opts) => {
    const { tokens } = await runLoopbackAuthFlow();

    const tempOAuth = createOAuth2Client();
    tempOAuth.setCredentials(tokens);
    const { google } = await import('googleapis');
    const gmail = google.gmail({ version: 'v1', auth: tempOAuth });
    const { data: profile } = await gmail.users.getProfile({ userId: 'me' });

    const id = opts.id || slugify(profile.emailAddress);
    await saveTokens(id, tokens);
    upsertAccountMeta({
      id,
      email: profile.emailAddress,
      label: opts.label || '',
      addedAt: new Date().toISOString(),
    });

    console.log(`\nConnected ${profile.emailAddress} as account "${id}".`);
  });

program
  .command('list-accounts')
  .description('List configured accounts')
  .action(() => {
    const accounts = listAccounts();
    if (!accounts.length) {
      console.log('No accounts configured yet. Run: gmail-mcp add-account');
      return;
    }
    for (const a of accounts) {
      console.log(`${a.id}\t${a.email}\t${a.label || ''}\t(added ${a.addedAt})`);
    }
  });

program
  .command('remove-account <idOrEmail>')
  .description('Remove a stored account and its encrypted tokens')
  .action((idOrEmail) => {
    const account = requireAccount(idOrEmail);
    deleteTokens(account.id);
    removeAccountMeta(account.id);
    console.log(`Removed account "${account.id}" (${account.email}). Its tokens were deleted locally.`);
    console.log('To fully revoke access, also remove it from https://myaccount.google.com/permissions');
  });

program
  .command('test-auth <idOrEmail>')
  .description('Verify stored credentials still work by fetching the account profile')
  .action(async (idOrEmail) => {
    const profile = await getUserProfile(idOrEmail);
    console.log(`OK: ${profile.emailAddress} — ${profile.messagesTotal} messages, ${profile.threadsTotal} threads.`);
  });

program.parseAsync(process.argv);
