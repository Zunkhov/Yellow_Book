import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  const count = await prisma.yellowBookEntry.count();
  console.log('📊 Total businesses:', count);

  const sample = await prisma.yellowBookEntry.findMany({
    take: 5,
    select: {
      name: true,
      categories: true,
      city: true,
      description: true,
    },
  });

  console.log('\n📋 Sample businesses:');
  sample.forEach((b, i) => {
    console.log(`\n${i + 1}. ${b.name} (${b.city})`);
    console.log(`   Categories: ${b.categories.join(', ')}`);
    console.log(`   Description: ${b.description.substring(0, 100)}...`);
  });

  await prisma.$disconnect();
}

checkDatabase();
