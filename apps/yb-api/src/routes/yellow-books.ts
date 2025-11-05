import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/yellow-books - List all
router.get('/', async (req, res) => {
  try {
    const entries = await prisma.yellowBookEntry.findMany();
    
    const transformed = entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      description: entry.description,
      phone: entry.phone,
      email: entry.email,
      website: entry.website ?? undefined,
      address: {
        street: entry.street,
        city: entry.city,
        state: entry.state,
        postalCode: entry.postalCode,
        country: entry.country,
      },
      categories: entry.categories,
      location: {
        lat: parseFloat(entry.latitude.toString()),
        lng: parseFloat(entry.longitude.toString()),
      },
      metadata: entry.metadata as any,
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching yellow books:', error);
    res.status(500).json({ error: 'Failed to fetch yellow books' });
  }
});

// GET /api/yellow-books/:id - Single entry (ADD THIS)
router.get('/:id', async (req, res) => {
  try {
    const entry = await prisma.yellowBookEntry.findUnique({
      where: { id: req.params.id }
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    const transformed = {
      id: entry.id,
      name: entry.name,
      description: entry.description,
      phone: entry.phone,
      email: entry.email,
      website: entry.website ?? undefined,
      address: {
        street: entry.street,
        city: entry.city,
        state: entry.state,
        postalCode: entry.postalCode,
        country: entry.country,
      },
      categories: entry.categories,
      location: {
        lat: parseFloat(entry.latitude.toString()),
        lng: parseFloat(entry.longitude.toString()),
      },
      metadata: entry.metadata as any,
    };

    console.log(`✅ Fetched entry: ${entry.name}`);
    res.json(transformed);
  } catch (error) {
    console.error('Error fetching entry:', error);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

export default router;