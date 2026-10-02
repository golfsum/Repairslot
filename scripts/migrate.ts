import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
if(!process.env.DATABASE_URL)throw new Error('Provide an approved DATABASE_URL in the process environment.');
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:1});
try{await pool.query(await readFile(new URL('../db/001-booking.sql',import.meta.url),'utf8'));console.log('Booking migration completed.');}finally{await pool.end();}
