/**
 * AI Search Service for Yellow Book
 * 
 * Implements RAG (Retrieval-Augmented Generation) for intelligent business search.
 * Uses vector similarity search + Gemini AI for natural language answers.
 */

import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface SearchResult {
  answer: string;
  businesses: Array<{
    id: string;
    name: string;
    description: string;
    categories: string[];
    city: string;
    state: string;
    phone: string;
    email: string;
    website: string | null;
    relevanceScore?: number;
  }>;
  cached: boolean;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generate embedding for search query
 */
async function generateQueryEmbedding(query: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'embedding-001' });
  const result = await model.embedContent(query);
  return result.embedding.values;
}

/**
 * Find most relevant businesses using vector similarity
 */
async function findRelevantBusinesses(
  queryEmbedding: number[],
  city?: string,
  limit: number = 5
): Promise<any[]> {
  // Get all businesses with embeddings
  const where: any = {
    embedding: { not: null },
  };
  
  if (city) {
    where.city = { contains: city, mode: 'insensitive' };
  }
  
  const businesses = await prisma.yellowBookEntry.findMany({ where });
  
  // Calculate similarity scores
  const scored = businesses.map(business => {
    const embedding = business.embedding as number[];
    const similarity = cosineSimilarity(queryEmbedding, embedding);
    
    return {
      ...business,
      relevanceScore: similarity,
    };
  });
  
  // Sort by relevance and return top N
  return scored
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}

/**
 * Generate AI answer using retrieved businesses
 */
async function generateAnswer(
  question: string,
  businesses: any[]
): Promise<string> {
  const context = businesses
    .map((b, i) => {
      return `${i + 1}. ${b.name}
   Description: ${b.description}
   Categories: ${b.categories.join(', ')}
   Location: ${b.city}, ${b.state}
   Contact: ${b.phone} | ${b.email}`;
    })
    .join('\n\n');
  
  const prompt = `You are a helpful assistant for Yellow Book, a business directory service.

User Question: "${question}"

Relevant Businesses Found:
${context}

Instructions:
- Answer the user's question based on the businesses provided
- Be concise and helpful
- Mention specific business names when relevant
- Include contact information if the user is looking for how to reach them
- If no relevant businesses found, politely say so

Answer:`;

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  return response.text();
}

/**
 * Simple in-memory cache (you can replace with Redis later)
 */
const searchCache = new Map<string, { result: SearchResult; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCacheKey(question: string, city?: string): string {
  return `${question.toLowerCase()}|${city?.toLowerCase() || 'all'}`;
}

function getFromCache(key: string): SearchResult | null {
  const cached = searchCache.get(key);
  if (!cached) return null;
  
  // Check if expired
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    searchCache.delete(key);
    return null;
  }
  
  return { ...cached.result, cached: true };
}

function setCache(key: string, result: SearchResult): void {
  searchCache.set(key, {
    result,
    timestamp: Date.now(),
  });
}

/**
 * Fallback keyword-based search when embedding quota is exhausted
 */
async function keywordSearch(
  question: string,
  city?: string,
  topK: number = 5
): Promise<any[]> {
  console.log('📝 Using keyword-based search (embedding quota exhausted)');

  const allBusinesses = await prisma.yellowBookEntry.findMany({
    where: city ? { city: { contains: city, mode: 'insensitive' } } : {},
  });

  const questionLower = question.toLowerCase();
  
  // Remove common words and extract meaningful keywords
  const stopWords = ['where', 'can', 'find', 'looking', 'for', 'need', 'want', 'good', 'best', 'the', 'a', 'an', 'in', 'at', 'to', 'from'];
  const keywords = questionLower
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.includes(w));

  console.log('🔑 Search keywords:', keywords);

  // Score businesses based on keyword matches
  const scored = allBusinesses.map((business) => {
    const searchText = [
      business.name,
      business.description || '',
      business.city || '',
      ...(business.categories || []),
    ]
      .join(' ')
      .toLowerCase();

    let score = 0;
    keywords.forEach((keyword) => {
      // Exact word match
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(searchText)) {
        score += 3;
      }
      // Partial match
      else if (searchText.includes(keyword)) {
        score += 1;
      }
    });

    // Boost if exact phrase match
    if (keywords.length > 1 && searchText.includes(keywords.join(' '))) {
      score += 5;
    }

    return { ...business, score };
  });

  console.log('📊 Top scores:', scored.slice(0, 3).map(b => ({ name: b.name, score: b.score })));

  // Return top K matches
  return scored
    .filter((b) => b.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      categories: b.categories || [],
      city: b.city,
      state: b.state,
      phone: b.phone,
      email: b.email,
      website: b.website,
      relevanceScore: Math.min(b.score / 10, 0.95), // Normalize to 0-0.95
    }));
}

/**
 * Main search function - implements full RAG pipeline
 */
export async function searchBusinessesWithAI(
  question: string,
  city?: string
): Promise<SearchResult> {
  // Check cache first
  const cacheKey = getCacheKey(question, city);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('🎯 Cache hit!');
    return cached;
  }
  
  console.log('🔍 Processing new search...');
  
  let relevantBusinesses: any[] = [];
  let useKeywordFallback = false;

  try {
    // Step 1: Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(question);
    
    // Step 2: Find relevant businesses (vector similarity search)
    relevantBusinesses = await findRelevantBusinesses(
      queryEmbedding,
      city,
      5
    );
  } catch (error: any) {
    // If quota exceeded, fall back to keyword search
    if (error.status === 429 || error.message?.includes('quota')) {
      console.log('⚠️ Embedding quota exceeded, using keyword search fallback');
      useKeywordFallback = true;
      relevantBusinesses = await keywordSearch(question, city, 5);
    } else {
      throw error;
    }
  }
  
  if (relevantBusinesses.length === 0) {
    const result: SearchResult = {
      answer: "I couldn't find any businesses matching your query. Please try different keywords or expand your search area.",
      businesses: [],
      cached: false,
    };
    setCache(cacheKey, result);
    return result;
  }
  
  // Step 3: Generate AI answer using retrieved context
  let answer: string;
  try {
    answer = await generateAnswer(question, relevantBusinesses);
    
    // Add fallback notice if we used keyword search
    if (useKeywordFallback) {
      answer += '\n\n_Note: Results generated using keyword matching (AI embedding quota temporarily exhausted)._';
    }
  } catch (error: any) {
    // If answer generation also fails, provide a simple summary
    console.log('⚠️ Answer generation failed, using simple summary');
    const businessList = relevantBusinesses
      .map((b, i) => `${i + 1}. **${b.name}**${b.city ? ` - ${b.city}` : ''}`)
      .join('\n');
    answer = `Found ${relevantBusinesses.length} business(es) matching "${question}":\n\n${businessList}\n\n_Note: AI response generation temporarily unavailable._`;
  }
  
  // Step 4: Format response
  const result: SearchResult = {
    answer,
    businesses: relevantBusinesses.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      categories: b.categories,
      city: b.city,
      state: b.state,
      phone: b.phone,
      email: b.email,
      website: b.website,
      relevanceScore: b.relevanceScore,
    })),
    cached: false,
  };
  
  // Cache the result
  setCache(cacheKey, result);
  
  return result;
}
