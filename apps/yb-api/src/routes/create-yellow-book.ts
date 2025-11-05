import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { YellowBookEntrySchema } from '@adoptable/shared-contract';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// POST /yellow-books
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const validated = YellowBookEntrySchema.omit({ id: true }).parse(req.body);

    // Create entry
    const entry = await prisma.yellowBookEntry.create({
      data: {
        name: validated.name,
        description: validated.description,
        phone: validated.phone,
        email: validated.email,
        website: validated.website,
        street: validated.address.street,
        city: validated.address.city,
        state: validated.address.state,
        postalCode: validated.address.postalCode,
        country: validated.address.country,
        categories: validated.categories,
        latitude: new Decimal(validated.location.lat.toString()),
        longitude: new Decimal(validated.location.lng.toString()),
      },
    });

    // Transform response
    const response = {
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
        lat: entry.latitude.toNumber(),
        lng: entry.longitude.toNumber(),
      },
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.issues,
      });
      return;
    }
    next(error);
  }
});

export default router;