import { Lucia } from 'lucia';
import { BunSQLiteAdapter } from '@lucia-auth/adapter-sqlite';
import { db } from './db';
import { GitHub } from 'arctic';

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
  getUserAttributes: (attributes) => {
    return {
      github_id: attributes.github_id,
      username: attributes.username,
    };
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  github_id: number;
  username: string;
}

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
);
