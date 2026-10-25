import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getEnv } from "@/lib/env";

type DbClient = ReturnType<typeof createDb>;

const globalForDb = globalThis as unknown as { db?: DbClient };

function createDb() {
  const client = postgres(getEnv().DATABASE_URL, {
    max: getEnv().NODE_ENV === "production" ? 20 : 5,
    prepare: false,
  });
  return drizzle(client);
}

export function getDb() {
  if (!globalForDb.db) globalForDb.db = createDb();
  return globalForDb.db;
}
