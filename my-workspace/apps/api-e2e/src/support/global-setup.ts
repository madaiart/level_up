import { waitForPortOpen } from '@nx/node/utils';

const host = process.env.HOST ?? '127.0.0.1';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

export async function setup() {
  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');
  await waitForPortOpen(port, { host });
}

export async function teardown() {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // The API itself is stopped by Nx, since `api:serve` is a continuous dependency.
  console.log('\nTearing down...\n');
}
