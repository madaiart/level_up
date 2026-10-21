-- migrate:up

-- IDs are UUIDv7 ("sequential GUIDs"): globally unique, but time-ordered so
-- B-tree inserts stay sequential. uuidv7() is built into Postgres 18.

create table users (
  id         uuid primary key default uuidv7(),
  name       varchar(100) not null,
  email      varchar(320) not null,
  created_at timestamptz  not null default now(),
  updated_at timestamptz  not null default now()
);

-- Case-insensitive uniqueness: "Ana@x.com" and "ana@x.com" are the same user.
create unique index users_email_unique on users (lower(email));

-- Each todo belongs to exactly one user (non-null FK, no join table), so todos
-- can never be shared. Deleting a user deletes their todos.
create table todos (
  id         uuid primary key default uuidv7(),
  title      varchar(200) not null,
  completed  boolean      not null default false,
  user_id    uuid         not null references users (id) on delete cascade,
  created_at timestamptz  not null default now(),
  updated_at timestamptz  not null default now()
);

create index todos_user_id_idx on todos (user_id);

-- Keep updated_at current on every UPDATE, whoever runs the query.
create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on users
  for each row execute function set_updated_at();

create trigger todos_set_updated_at
  before update on todos
  for each row execute function set_updated_at();

-- migrate:down

drop table todos;
drop table users;
drop function set_updated_at();
