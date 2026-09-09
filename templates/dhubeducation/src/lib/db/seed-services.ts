import fs from 'fs';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { service } from './schema';

dotenv.config();

async function seed() {
  const csvFile = './resources/service.csv';
  const fileContent = fs.readFileSync(csvFile, 'utf-8');

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Parsed ${records.length} records from CSV.`);

  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  for (const record of records) {
    const data = {
      id: record.xata_id,
      name: record.name,
      description: record.description,
      fileId: record.file,
      content: record.content,
      createdAt: new Date(record.xata_createdat),
      updatedAt: new Date(record.xata_updatedat),
    };

    try {
      await db.insert(service).values(data).onConflictDoUpdate({
        target: service.id,
        set: {
          name: data.name,
          description: data.description,
          fileId: data.fileId,
          content: data.content,
          updatedAt: data.updatedAt,
        }
      });
      console.log(`Upserted service: ${data.name}`);
    } catch (error) {
      console.error(`Error upserting service ${data.name}:`, error);
    }
  }

  console.log('Seeding completed.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
