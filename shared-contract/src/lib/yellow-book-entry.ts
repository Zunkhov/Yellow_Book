import { z } from "zod";

export const YellowBookEntrySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  website: z.string().url().optional(),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
  categories: z.array(z.string().min(1)).min(1),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  metadata: z.object({
    founded: z.string().optional(),
    logo: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
    services: z.array(z.string()).optional(),
  }).optional(),
});

export type YellowBookEntry = z.infer<typeof YellowBookEntrySchema>;