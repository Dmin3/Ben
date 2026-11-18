import { readFileSync } from 'node:fs'

import postgres from 'postgres'

function loadEnvFile() {
  const text = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2]
  }
}

loadEnvFile()
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

const sql = postgres(process.env.DATABASE_URL, { max: 1 })
const seeds = [
  {
    code: 'sejin-bag', name: '세진가방', legalName: 'SEJIN BAG CO., LTD.', country: 'CN', region: '중국 선전',
    address: '중국 광동성 선전', manager: '공장 담당자', category: '가방', grade: 'EXCELLENT',
    tags: ['BAG', 'Tote', 'Pouch', 'Keyring'], deals: 42, amount: 1420000, onTime: 96, defect: 1.3, lead: 31,
    yearly: [{ year: 2023, deals: 8, amount: 260000 }, { year: 2024, deals: 11, amount: 380000 }, { year: 2025, deals: 13, amount: 450000 }, { year: 2026, deals: 10, amount: 330000 }],
    categories: [{ name: 'Tote', deals: 18 }, { name: 'Pouch', deals: 12 }, { name: 'Keyring', deals: 8 }, { name: '기타', deals: 4 }],
  },
  {
    code: 'foc-apparel', name: 'FOC의류', legalName: 'FOC APPAREL CO., LTD.', country: 'CN', region: '중국 광저우',
    address: '중국 광동성 광저우', manager: '공장 담당자', category: '의류', grade: 'EXCELLENT',
    tags: ['COAT', 'Jacket', 'Knit'], deals: 28, amount: 2150000, onTime: 89, defect: 2.1, lead: 38,
    yearly: [{ year: 2024, deals: 8, amount: 540000 }, { year: 2025, deals: 12, amount: 980000 }, { year: 2026, deals: 8, amount: 630000 }],
    categories: [{ name: 'Coat', deals: 14 }, { name: 'Jacket', deals: 9 }, { name: 'Knit', deals: 5 }],
  },
  {
    code: 'xintang-denim', name: '신탕청바지', legalName: 'XINTANG DENIM CO., LTD.', country: 'CN', region: '중국 광저우',
    address: '중국 광동성 광저우 신탕', manager: '공장 담당자', category: '패션잡화', grade: 'GOOD',
    tags: ['DENIM', 'Denim Pants', 'Denim Jacket', 'Skirt', 'Shorts', 'Overall'], deals: 36, amount: 1080000, onTime: 92, defect: 1.8, lead: 27,
    yearly: [{ year: 2023, deals: 6, amount: 170000 }, { year: 2024, deals: 9, amount: 260000 }, { year: 2025, deals: 12, amount: 360000 }, { year: 2026, deals: 9, amount: 290000 }],
    categories: [{ name: 'Denim Pants', deals: 16 }, { name: 'Denim Jacket', deals: 8 }, { name: 'Skirt', deals: 6 }, { name: 'Shorts', deals: 4 }, { name: '기타', deals: 2 }],
  },
  {
    code: 'panyu-apparel', name: '판위의류', legalName: 'PANYU APPAREL CO., LTD.', country: 'CN', region: '중국 광저우',
    address: '중국 광동성 광저우 판위구', manager: '공장 담당자', category: '의류', grade: 'GOOD',
    tags: ['HOME WEAR', 'Pajama'], deals: 12, amount: 640000, onTime: 87, defect: 2.4, lead: 33,
    yearly: [{ year: 2025, deals: 5, amount: 210000 }, { year: 2026, deals: 7, amount: 430000 }],
    categories: [{ name: 'Home wear', deals: 8 }, { name: 'Pajama', deals: 4 }],
  },
]

try {
  const [account] = await sql`select id from accounts where code = 'demo' limit 1`
  if (!account) throw new Error('Run db:seed:option3 first: demo account not found')

  for (const seed of seeds) {
    await sql.begin(async (tx) => {
      const [factory] = await tx`
        insert into factories (code, name, legal_name, country_code, region, address, manager_name, primary_category, grade, status)
        values (${seed.code}, ${seed.name}, ${seed.legalName}, ${seed.country}, ${seed.region}, ${seed.address}, ${seed.manager}, ${seed.category}, ${seed.grade}, 'ACTIVE')
        on conflict (code) do update set
          name = excluded.name, legal_name = excluded.legal_name, country_code = excluded.country_code,
          region = excluded.region, address = excluded.address, manager_name = excluded.manager_name,
          primary_category = excluded.primary_category, grade = excluded.grade, status = 'ACTIVE', updated_at = now()
        returning id
      `
      await tx`delete from factory_tags where factory_id = ${factory.id}`
      for (const tag of seed.tags) await tx`insert into factory_tags (factory_id, tag) values (${factory.id}, ${tag})`
      await tx`
        insert into account_factories (account_id, factory_id, status)
        values (${account.id}, ${factory.id}, 'ACTIVE')
        on conflict (account_id, factory_id) do update set status = 'ACTIVE', updated_at = now()
      `
      await tx`
        insert into factory_metrics (account_id, factory_id, deals, total_amount, on_time_rate, defect_rate, avg_lead_days, yearly, category_share)
        values (${account.id}, ${factory.id}, ${seed.deals}, ${seed.amount}, ${seed.onTime}, ${seed.defect}, ${seed.lead}, ${tx.json(seed.yearly)}, ${tx.json(seed.categories)})
        on conflict (account_id, factory_id) do update set
          deals = excluded.deals, total_amount = excluded.total_amount, on_time_rate = excluded.on_time_rate,
          defect_rate = excluded.defect_rate, avg_lead_days = excluded.avg_lead_days,
          yearly = excluded.yearly, category_share = excluded.category_share, calculated_at = now()
      `
    })
  }

  const [foc] = await sql`select id from factories where code = 'foc-apparel'`
  await sql`delete from factory_issues where account_id = ${account.id}`
  await sql`
    insert into factory_issues (account_id, factory_id, type, title, order_code, occurred_at, resolved)
    values (${account.id}, ${foc.id}, 'DEFECT', '단추 봉제 불량 12장', 'BEN-2026-0002', '2026-09-18T00:00:00Z', false)
  `
  console.log('Seeded 4 factories for demo account.')
} finally {
  await sql.end()
}
