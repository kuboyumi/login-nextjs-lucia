import { Database } from 'bun:sqlite';

export const db = new Database('main.db');

db.exec(`create table if not exists user (
  id text not null primary key,
  github_id integer unique,
  username text not null,
  password text 
)`);

db.exec(`create table if not exists session (
  id text not null primary key,
  expires_at integer not null,
  user_id text not null,
  foreign key (user_id) references user(id)
)`);

export interface DatabaseUser {
  id: string;
  github_id: number;
  username: string;
  password: string;
}
