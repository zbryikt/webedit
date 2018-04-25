require! <[../../../secret ../postgresql pg bluebird]>

queries = []

queries.push init-users-table = """create table if not exists users (
  key serial primary key,
  username text not null unique constraint nlen check (char_length(username) <= 100),
  password text constraint pwlen check (char_length(password) <= 100),
  usepasswd boolean,
  displayname text, constraint displaynamelength check (char_length(displayname) <= 100),
  description text,
  datasize int,
  createdtime timestamp,
  lastactive timestamp,
  public_email boolean,
  avatar text,
  detail jsonb,
  payment jsonb,
  config jsonb,
  deleted boolean
)"""

# privacy: 0 or null(writable), 10(read only), 20(private)
queries.push init-doc-table = """create table if not exists doc (
  key serial primary key,
  slug text,
  title text constraint nlen check (char_length(title) <= 80),
  thumbnail text constraint tlen check (char_length(thumbnail) <= 192),
  domain text,
  path text,
  gacode text,
  tags jsonb,
  privacy int,
  owner int references users(key),
  createdtime timestamp default now(),
  modifiedtime timestamp default now(),
  deleted bool
)"""

queries.push init-team-table = """create table if not exists team (
  key serial primary key,
  name text not null unique constraint nlen check (char_length(name) <= 100)
)"""

queries.push init-crew-table = """create table if not exists crew (
  team int references team(key),
  "user" int references users(key)
)"""

#permission definition: 10(view), 20(comment), 30(edit), 40(admin)
queries.push init-page-perm-table = """create table if not exists doc_perm (
  doc int references doc(key),
  uid int,
  perm int,
  unique (doc, uid)
)"""

queries.push init-pwresettoken-table = """create table if not exists pwresettoken (
  owner int references users(key),
  token text,
  time timestamp
)"""

queries.push init-sessions-table = """create table if not exists sessions (
  key text not null unique primary key,
  detail jsonb
)"""

client = new pg.Client secret.io-pg.uri
(e) <- client.connect
if e => return console.log e
console.log "connected"

query = (q) -> new bluebird (res, rej) ->
  (e,r) <- client.query q, _
  if e => rej e
  res r

consume = ->
  if queries.length =>
    task = queries.splice(0, 1).0
    query task
      .then -> consume!
      .catch -> [console.log(it), client.end!]
  else
    console.log "done."
    client.end!

consume!
/*
query init-users-table
  .then -> query init-sessions-table
  .then ->
    console.log "done."
    client.end!
  .catch -> [console.log(it), client.end!]
*/
