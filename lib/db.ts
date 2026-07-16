import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

const globalForDatabase = globalThis as typeof globalThis & {
  whetstonePool?: Pool;
};

const pool = globalForDatabase.whetstonePool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.whetstonePool = pool;
}

export const db = drizzle(pool, { schema });
