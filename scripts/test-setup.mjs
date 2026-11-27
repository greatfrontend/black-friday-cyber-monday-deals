import { exportCatalogs, readCatalogs } from './deal-data.mjs';

export default async function setup() {
  await exportCatalogs(await readCatalogs());
}
