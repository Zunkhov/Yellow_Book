/**
 * Embedding Script for Yellow Book Businesses
 * 
 * This script generates embeddings for all businesses that don't have one yet.
 * Uses Google Gemini API for text embedding.
 * 
 * Usage: npx tsx tools/embed-businesses.ts
 */

import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

function createBusinessText(business: any): string {
  // Combine name, description, categories, and city for embedding
  const parts = [
    business.name,
    business.description,
    business.categories.join(', '),
    `Located in ${business.city}, ${business.state}`,
  ];
  
  return parts.filter(Boolean).join('. ');
}

async function embedBusinesses() {
  console.log('🚀 Starting embedding process...\n');
  
  // Find all businesses (we'll filter null embeddings in JS)
  const allBusinesses = await prisma.yellowBookEntry.findMany();
  
  // Filter businesses without embeddings
  const businesses = allBusinesses.filter(b => !b.embedding);
  
  console.log(`📊 Found ${businesses.length} businesses to embed\n`);
  
  if (businesses.length === 0) {
    console.log('✅ All businesses already have embeddings!');
    return;
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    console.log(`[${i + 1}/${businesses.length}] Processing: ${business.name}`);
    
    try {
      // Create text representation
      const text = createBusinessText(business);
      
      // Generate embedding
      const embedding = await generateEmbedding(text);
      
      // Update database
      await prisma.yellowBookEntry.update({
        where: { id: business.id },
        data: { embedding: embedding as any },
      });
      
      successCount++;
      console.log(`  ✅ Success (${embedding.length} dimensions)\n`);
      
      // Rate limiting: wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Error:`, error instanceof Error ? error.message : error);
      console.log('');
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📈 Summary:');
  console.log(`  ✅ Successfully embedded: ${successCount}`);
  console.log(`  ❌ Failed: ${errorCount}`);
  console.log(`  📊 Total processed: ${successCount + errorCount}`);
  console.log('='.repeat(50));
}

async function main() {
  try {
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ Error: GEMINI_API_KEY environment variable is not set');
      console.log('\nPlease set your Gemini API key:');
      console.log('  Windows: $env:GEMINI_API_KEY="your-api-key"');
      console.log('  Linux/Mac: export GEMINI_API_KEY="your-api-key"');
      process.exit(1);
    }
    
    await embedBusinesses();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
