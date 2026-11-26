import { cp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { sponsorSlotCount, validateSponsorship } from './deal-validation.mjs';

const maxLogoBytes = 100 * 1024;

function getLogoDirectory(root, year) {
  return path.join(root, 'assets/sponsors', String(year));
}

async function readOptionalJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

async function assertSponsorLogo(logo, directory) {
  const file = path.join(directory, logo);
  const logoStats = await stat(file).catch(() => null);

  if (!logoStats?.isFile()) {
    throw new Error(`sponsor logo ${logo} is missing from ${directory}`);
  }

  if (logoStats.size > maxLogoBytes) {
    throw new Error(`sponsor logo ${logo} must be 100 KB or smaller`);
  }
}

// Years without a sponsorship file have no sponsor slots.
export async function readSponsorship(year, root) {
  const file = path.join(root, 'data/sponsors', `${year}.json`);
  const source = await readOptionalJson(file);

  if (!source) {
    return null;
  }

  try {
    const { $schema, year: sponsorshipYear, ...sponsorship } = validateSponsorship(source);

    if (sponsorshipYear !== year) {
      throw new Error('filename must match sponsorship.year');
    }

    for (const slot of sponsorship.slots) {
      if (slot.logo) {
        await assertSponsorLogo(slot.logo, getLogoDirectory(root, year));
      }
    }

    return { ...sponsorship, slotCount: sponsorSlotCount };
  } catch (error) {
    throw new Error(`${file}: ${error.message}`);
  }
}

export async function exportSponsorLogos(catalogs, root) {
  const destination = path.join(root, 'www/public/sponsors');
  await rm(destination, { recursive: true, force: true });

  for (const { year, sponsorship } of catalogs) {
    for (const { logo } of sponsorship?.slots ?? []) {
      if (!logo) {
        continue;
      }

      await mkdir(path.join(destination, String(year)), { recursive: true });
      await cp(
        path.join(getLogoDirectory(root, year), logo),
        path.join(destination, String(year), logo),
      );
    }
  }
}
