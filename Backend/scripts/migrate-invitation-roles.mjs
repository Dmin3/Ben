import { randomInt } from 'node:crypto';
import postgres from 'postgres';
process.loadEnvFile('.env.local');
const db=postgres(process.env.DATABASE_URL,{max:1});
try {
 await db.begin(async tx=>{
  await tx`select pg_advisory_xact_lock(76423981)`;
  // Explicit bootstrap only when exactly one active legacy operator exists.
  const supers=await tx`select id from users where system_role='SUPER_ADMIN' and status='ACTIVE'`;
  if(!supers.length){
   const admins=await tx`select id from users where system_role='BEN_ADMIN' and status='ACTIVE'`;
   if(admins.length!==1)throw new Error('최초 최고관리자 지정 대상이 유일하지 않습니다.');
   await tx`update users set system_role='SUPER_ADMIN', updated_at=now() where id=${admins[0].id}`;
  }
  await tx`update account_members set role='MEMBER', updated_at=now() where type='SUB' and role='ADMIN'`;
  const rows=await tx`select id from accounts where invitation_code is null for update`;
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for(const row of rows){
   let code;
   do {code=Array.from({length:12},()=>alphabet[randomInt(36)]).join('');}
   while((await tx`select id from accounts where invitation_code=${code}`).length);
   await tx`update accounts set invitation_code=${code} where id=${row.id}`;
  }
  console.log('초대코드 초기화 및 기존 단일 운영자 최고관리자 전환 완료');
 });
} finally {await db.end();}

