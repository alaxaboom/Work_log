import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const workTypes = [
  { name: 'Кладка перегородок', unit: 'м²' },
  { name: 'Монтаж опалубки', unit: 'м²' },
  { name: 'Бетонирование', unit: 'м³' },
];

async function main() {
  const existingCount = await prisma.workType.count();
  if (existingCount === 0) {
    await prisma.workType.createMany({ data: workTypes });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
