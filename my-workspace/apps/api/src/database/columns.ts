import { z } from 'zod';

/** A `timestamptz` column: postgres.js returns a Date, the API sends an ISO string. */
export const timestamptz = z.codec(z.date(), z.iso.datetime(), {
  decode: (date) => date.toISOString(),
  encode: (iso) => new Date(iso),
});
