import { readCatalogs, syncMarkdown, exportCatalogs } from './deal-data.mjs';

const supportedCommands = new Set(['validate', 'sync', 'check', 'export']);

function parseCommand(args) {
  const [command = 'validate'] = args;

  if (!supportedCommands.has(command)) {
    throw new Error(`Unknown command: ${command}`);
  }

  return command;
}

async function runCommand(command, catalogs) {
  switch (command) {
    case 'validate':
      // Reading catalogs already validates their contents.
      return;
    case 'sync':
      return syncMarkdown(catalogs, { write: true });
    case 'check':
      return syncMarkdown(catalogs);
    case 'export':
      return exportCatalogs(catalogs);
  }
}

function printSummary(command, catalogs) {
  const dealCount = catalogs.reduce((total, catalog) => total + catalog.deals.length, 0);
  console.log(`${command}: ${dealCount} deals across ${catalogs.length} catalogs passed.`);
}

// A reminder, not a failure: checks must not start failing because a date passed.
function printOverdueSponsorships(catalogs) {
  const today = new Date().toISOString().slice(0, 10);

  for (const { year, sponsorship } of catalogs) {
    if (sponsorship?.status === 'active' && sponsorship.endsOn < today) {
      console.warn(
        `Reminder: ${year} sponsorships ended on ${sponsorship.endsOn}. ` +
          `Set "status" to "ended" in data/sponsors/${year}.json and run data:sync.`,
      );
    }
  }
}

async function main() {
  const command = parseCommand(process.argv.slice(2));
  const catalogs = await readCatalogs();

  await runCommand(command, catalogs);
  printSummary(command, catalogs);

  if (command === 'check') {
    printOverdueSponsorships(catalogs);
  }
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
