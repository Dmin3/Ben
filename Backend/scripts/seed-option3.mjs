import { createHmac } from 'node:crypto'
import { readFileSync } from 'node:fs'

import argon2 from 'argon2'
import postgres from 'postgres'

function loadEnvFile() {
  const text = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2]
  }
}

loadEnvFile()
if (
  !process.env.DATABASE_URL ||
  !process.env.JWT_REFRESH_SECRET ||
  !process.env.SEED_BEN_ADMIN_PASSWORD ||
  !process.env.SEED_DEMO_OWNER_PASSWORD
) {
  throw new Error('Database, JWT, and seed password environment variables are required')
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 })
const demoBusinessNumber = '0000000015'
const demoBusinessHash = createHmac('sha256', process.env.JWT_REFRESH_SECRET)
  .update(demoBusinessNumber)
  .digest('hex')

const seeds = [
  {
    email: 'admin@ben-logistics.com',
    password: process.env.SEED_BEN_ADMIN_PASSWORD,
    name: 'BEN 관리자',
    systemRole: 'BEN_ADMIN',
    accountCode: 'ben-internal',
    accountName: 'BEN 운영',
    businessHash: null,
    businessLast4: null,
    memberLimit: 5,
  },
  {
    email: 'owner@demo-ben.com',
    password: process.env.SEED_DEMO_OWNER_PASSWORD,
    name: '데모 고객사 관리자',
    systemRole: 'USER',
    accountCode: 'demo',
    accountName: 'BEN 데모 고객사',
    businessHash: demoBusinessHash,
    businessLast4: demoBusinessNumber.slice(-4),
    memberLimit: 20,
  },
]

try {
  for (const seed of seeds) {
    await sql.begin(async (tx) => {
      const passwordHash = await argon2.hash(seed.password)
      const [user] = await tx`
        insert into users (email, email_verified, name, status, system_role)
        values (${seed.email}, true, ${seed.name}, 'ACTIVE', ${seed.systemRole})
        on conflict (email) where email is not null
        do update set name = excluded.name,
          system_role = case when users.system_role = 'SUPER_ADMIN' then users.system_role else excluded.system_role end,
          updated_at = now()
        returning id
      `
      const [account] = await tx`
        insert into accounts (
          code, name, owner_user_id, business_number_hash,
          business_number_last4, member_limit, active
        )
        values (
          ${seed.accountCode}, ${seed.accountName}, ${user.id}, ${seed.businessHash},
          ${seed.businessLast4}, ${seed.memberLimit}, true
        )
        on conflict (code)
        do update set
          name = excluded.name,
          owner_user_id = excluded.owner_user_id,
          business_number_hash = excluded.business_number_hash,
          business_number_last4 = excluded.business_number_last4,
          member_limit = excluded.member_limit,
          active = true,
          updated_at = now()
        returning id
      `
      const existingMembers = await tx`
        select id from account_members
        where account_id = ${account.id} and user_id = ${user.id}
        limit 1
      `
      const member = existingMembers[0] ?? (await tx`
        insert into account_members (
          account_id, user_id, type, role, auth_method, status, permissions
        )
        values (${account.id}, ${user.id}, 'MAIN', 'OWNER', 'LOCAL_ONLY', 'ACTIVE', ${tx.json(['*'])})
        returning id
      `)[0]
      await tx`
        insert into local_credentials (member_id, account_id, login_id, password_hash)
        values (${member.id}, ${account.id}, ${seed.email}, ${passwordHash})
        on conflict (member_id)
        do update set
          login_id = excluded.login_id,
          password_hash = excluded.password_hash,
          password_changed_at = now(),
          failed_attempts = 0,
          locked_until = null
      `
    })
  }
  console.log('Seeded BEN admin and demo customer MAIN account.')
} finally {
  await sql.end()
}
