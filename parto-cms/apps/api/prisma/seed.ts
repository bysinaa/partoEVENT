import { seed } from '../src/seed';

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
