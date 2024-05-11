import { Lucia } from 'lucia';
import { BunSQLiteAdapter } from '@lucia-auth/adapter-sqlite';
import { Database } from 'bun:sqlite';

const db = new Database();

const adapter = new BunSQLiteAdapter(db, {
  user: 'user',
  session: 'session',
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.BUN_ENV === 'production',
    },
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
  }
}
