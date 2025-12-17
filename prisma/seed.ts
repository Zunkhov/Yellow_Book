import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const data: Prisma.YellowBookEntryCreateInput[] = [
  {
    name: 'TechFlow Solutions',
    description: 'Leading software development company specializing in enterprise solutions and cloud computing.',
    phone: '+976-11-123456',
    email: 'contact@techflow.com',
    website: 'https://techflow.com',
    street: '123 Tech Street',
    city: 'Ulaanbaatar',
    state: 'UB',
    postalCode: '14140',
    country: 'Mongolia',
    categories: ['IT Companies', 'tech'],
    latitude: new Prisma.Decimal('47.9200'),
    longitude: new Prisma.Decimal('106.9100'),
    metadata: {
      founded: '2015',
      logo: 'https://images.unsplash.com/photo-1662052955098-042b46e60c2b?w=100',
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400'
      ],
      services: ['Web Development', 'Mobile Apps', 'Cloud Computing', 'AI Solutions', 'Data Analytics']
    }
  },
  {
    name: 'Golden Gate Bank',
    description: 'Your trusted financial partner offering comprehensive banking and investment services.',
    phone: '+976-11-654321',
    email: 'info@goldengate.bank',
    website: 'https://goldengate.bank',
    street: '456 Financial Plaza',
    city: 'Ulaanbaatar',
    state: 'UB',
    postalCode: '14130',
    country: 'Mongolia',
    categories: ['Banks', 'finance'],
    latitude: new Prisma.Decimal('47.9180'),
    longitude: new Prisma.Decimal('106.9170'),
    metadata: {
      founded: '1995',
      logo: 'https://images.unsplash.com/photo-1643258367012-1e1a983489e5?w=100',
      services: ['Personal Banking', 'Business Banking', 'Loans & Mortgages', 'Investment Services', 'Online Banking']
    }
  },
  {
    name: 'Bella Vista Restaurant',
    description: 'Fine dining experience with authentic Italian cuisine and exceptional service.',
    phone: '+976-11-222333',
    email: 'reservations@bellavista.com',
    website: 'https://bellavista.com',
    street: '789 Culinary Lane',
    city: 'Ulaanbaatar',
    state: 'UB',
    postalCode: '14120',
    country: 'Mongolia',
    categories: ['Restaurants', 'food'],
    latitude: new Prisma.Decimal('47.9150'),
    longitude: new Prisma.Decimal('106.9200'),
    metadata: {
      founded: '2010',
      logo: 'https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?w=100',
      services: ['Fine Dining', 'Catering', 'Private Events', 'Wine Selection', 'Takeout']
    }
  },
  {
    name: 'Prime Academy',
    description: 'Excellence in education with innovative learning approaches and experienced faculty.',
    phone: '+976-11-777888',
    email: 'admissions@primeacademy.edu',
    website: 'https://primeacademy.edu',
    street: '321 Education Blvd',
    city: 'Ulaanbaatar',
    state: 'UB',
    postalCode: '14110',
    country: 'Mongolia',
    categories: ['Education', 'school'],
    latitude: new Prisma.Decimal('47.9165'),
    longitude: new Prisma.Decimal('106.9155'),
    metadata: {
      founded: '2005',
      logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=100',
      services: ['K-12 Education', 'Advanced Placement', 'STEM Programs', 'Arts & Culture', 'Sports Programs']
    }
  },
];

async function main() {
  console.log('Start seeding...');
  
  // Clear existing data
  await prisma.yellowBookEntry.deleteMany();
  
  for (const entry of data) {
    const created = await prisma.yellowBookEntry.create({
      data: entry,
    });
    console.log(`Created entry: ${created.name}`);
  }
  
  // Seed admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@adoptable.com' },
    update: {},
    create: {
      email: 'admin@adoptable.com',
      name: 'Admin User',
      role: 'admin',
      emailVerified: new Date(),
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);
  
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });