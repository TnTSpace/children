import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

dotenv.config();
export const db = drizzle(env.DATABASE_URL!, { schema });
