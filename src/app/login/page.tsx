import Link from 'next/link';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { lucia, validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Form } from '@/lib/form';

import type { DatabaseUser } from '@/lib/db';
import type { ActionResult } from '@/lib/form';

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect('/');
  }
  return (
    <>
      <div>
        <h1>Sign in</h1>
        <Form action={login}>
          <label htmlFor="username">Username</label>
          <input name="username" id="username" />
          <br />
          <label htmlFor="password">Password</label>
          <input name="password" id="password" type="password" />
          <br />
          <button>Continue</button>
        </Form>
        <Link href="/signup">Create an account</Link>
      </div>
      <div>
        <h1>Sign in with GitHub</h1>
        <a href="/login/github">Sign in with GitHub</a>
      </div>
    </>
  );
}

async function login(_: any, formData: FormData): Promise<ActionResult> {
  'use server';
  const username = formData.get('username');
  if (
    typeof username !== 'string' ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return { error: 'Invalid username' };
  }
  const password = formData.get('password');
  if (
    typeof password !== 'string' ||
    password.length < 6 ||
    password.length > 255
  ) {
    return { error: 'Invalid password' };
  }

  const existingUser = db
    .prepare('select * from user where username = ?')
    .get(username) as DatabaseUser | undefined;
  if (!existingUser) {
    return {
      error: 'Incorrect username or password',
    };
  }

  const validPassword = await Bun.password.verify(
    password,
    existingUser.password,
  );
  if (!validPassword) {
    return {
      error: 'Incorrect username or password',
    };
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect('/');
}
