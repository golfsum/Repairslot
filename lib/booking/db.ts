import { Pool } from 'pg';
import { AppError } from './config';
export interface Queryable { query(text: string, values?: unknown[]): Promise<{rows: any[]; rowCount?: number | null}> }
export interface Database extends Queryable { transaction<T>(fn: (db: Queryable) => Promise<T>): Promise<T> }
let pool: Pool | undefined;
export function database(): Database {
  if (!process.env.DATABASE_URL) throw new AppError(503,'Database setup is required.');
  pool ??= new Pool({connectionString:process.env.DATABASE_URL,max:3,connectionTimeoutMillis:5000,idleTimeoutMillis:10000});
  const db = pool;
  return {
    query: (text,values) => db.query(text,values),
    async transaction(fn) {
      const client=await db.connect();
      try { await client.query('BEGIN'); const result=await fn(client); await client.query('COMMIT'); return result; }
      catch(e){await client.query('ROLLBACK');throw e;} finally {client.release();}
    }
  };
}
