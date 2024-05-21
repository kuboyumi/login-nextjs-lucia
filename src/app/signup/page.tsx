import Link from 'next/link';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { lucia, validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Form } from '@/lib/form';
import { generateId } from 'lucia';
import { SQLiteError } from 'bun:sqlite';

import type { ActionResult } from '@/lib/form';

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect('/');
  }
  return (
    <>
      <h1>Create an account</h1>
      <Form action={signup}>
        <label htmlFor="username">Username</label>
        <input name="username" id="username" />
        <br />
        <label htmlFor="password">Password</label>
        <input name="password" id="password" type="password" />
        <br />
        <button>Continue</button>
      </Form>
      <Link href="/login">Sign in</Link>
    </>
  );
}

async function signup(_: any, formData: FormData): Promise<ActionResult> {
  'use server';
  const username = formData.get('username');
  // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
  if (
    typeof username !== 'string' ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return {
      error: 'Invalid username',
    };
  }
  const password = formData.get('password');
  // password must be between 6 ~ 255 characters
  if (
    typeof password !== 'string' ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: 'Invalid password',
    };
  }

  const hashedPassword = await Bun.password.hash(password);
  const userId = generateId(15);

  try {
    db.prepare('insert into user(id, username, password) values (?, ?, ?)').run(
      userId,
      username,
      hashedPassword,
    );

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  } catch (e) {
    if (e instanceof SQLiteError && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return {
        error: 'Username already used',
      };
    }
    return {
      error: 'An unknown error occurred',
    };
  }
  return redirect('/');
}
