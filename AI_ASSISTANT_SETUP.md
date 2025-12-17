# Yellow Book AI Assistant - Complete Setup Guide 🤖

## Overview

This AI-powered intelligent search feature uses:
- **Google Gemini** - Free AI API for embeddings & chat
- **RAG (Retrieval-Augmented Generation)** - Vector similarity search + AI generation
- **In-memory Cache** - Fast repeated queries
- **Vector Embeddings** - Semantic search capabilities

## Prerequisites

1. ✅ PostgreSQL database running
2. ✅ Node.js & npm installed
3. 🆕 Google Gemini API key (free!)

## Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key" → "Create API key in new project"
3. Copy your API key

## Step 2: Set Environment Variable

### Windows PowerShell:
```powershell
$env:GEMINI_API_KEY="your_api_key_here"
```

### Linux/Mac:
```bash
export GEMINI_API_KEY="your_api_key_here"
```

### Or add to root `.env` file:
```
GEMINI_API_KEY=your_api_key_here
```

## Step 3: Install Dependencies

Already done! We installed `@google/generative-ai` package.

## Step 4: Generate Embeddings

Run the embedding script to process all existing businesses:

```bash
npx tsx tools/embed-businesses.ts
```

This will:
- Find all businesses without embeddings
- Generate vector embeddings using Gemini
- Store them in the database
- Show progress and summary

**Expected output:**
```
🚀 Starting embedding process...

📊 Found 4 businesses to embed

[1/4] Processing: TechFlow Solutions
  ✅ Success (768 dimensions)

[2/4] Processing: First National Bank
  ✅ Success (768 dimensions)

...

==================================================
📈 Summary:
  ✅ Successfully embedded: 4
  ❌ Failed: 0
  📊 Total processed: 4
==================================================
```

## Step 5: Start Backend Server

```bash
nx run yb-api:serve
```

Backend will be at: http://localhost:3333/api

## Step 6: Test AI Search API

### Using curl:
```bash
curl -X POST http://localhost:3333/api/ai/yellow-books/search \
  -H "Content-Type: application/json" \
  -d "{\"question\": \"Where can I find good IT companies?\"}"
```

### Using Postman:
- POST to `http://localhost:3333/api/ai/yellow-books/search`
- Body (JSON):
  ```json
  {
    "question": "Where can I find good restaurants?",
    "city": "New York"
  }
  ```

### Expected response:
```json
{
  "answer": "Based on the businesses in our directory, I found...",
  "businesses": [
    {
      "id": "...",
      "name": "...",
      "description": "...",
      ...
    }
  ],
  "cached": false
}
```

## Step 7: Access AI Assistant UI

Start frontend:
```bash
cd apps/adoptable
npx next dev -p 3000
```

Then visit: **http://localhost:3000/yellow-books/assistant**

## Usage Examples

Try asking:
- "Where can I find good Italian restaurants?"
- "I need a plumber in New York"
- "Show me banks with good customer service"
- "Find educational institutions"
- "Which IT companies offer cloud solutions?"

## Features

### ✅ Implemented

1. **Semantic Search** - Understanding meaning, not just keywords
2. **Vector Embeddings** - 768-dimensional vectors for each business
3. **RAG Pipeline** - Retrieve relevant + Generate answer
4. **Caching** - 1-hour cache for identical queries
5. **City Filter** - Optional location-based search
6. **Relevance Scoring** - Shows match percentage
7. **Beautiful UI** - Yellow Book branded interface

### 🎯 How It Works

1. User asks question
2. System generates embedding for question
3. Finds most similar businesses (cosine similarity)
4. Sends top matches to Gemini AI
5. AI generates natural language answer
6. Returns answer + business cards
7. Caches result for future requests

## Troubleshooting

### "GEMINI_API_KEY not set"
Make sure you set the environment variable before running scripts.

### "Error generating embedding"
- Check your API key is valid
- Ensure you have internet connection
- Verify you haven't exceeded free tier limits

### "No businesses found"
- Run the embedding script first
- Check your database has businesses
- Try broader search terms

### Backend not responding
- Make sure yb-api server is running on port 3333
- Check CORS settings allow localhost:3000

## API Documentation

### POST /api/ai/yellow-books/search

**Request:**
```typescript
{
  question: string;      // Required, min 3 chars
  city?: string;         // Optional filter
}
```

**Response:**
```typescript
{
  answer: string;        // AI-generated answer
  businesses: Array<{    // Relevant businesses
    id: string;
    name: string;
    description: string;
    categories: string[];
    city: string;
    state: string;
    phone: string;
    email: string;
    website: string | null;
    relevanceScore?: number;  // 0-1, higher = more relevant
  }>;
  cached: boolean;       // True if from cache
}
```

## Cost & Limits

**Google Gemini Free Tier:**
- 15 requests/minute
- 1,500 requests/day
- 1 million tokens/month

**Enough for:**
- Development & testing
- Small to medium deployments
- ~50,000 searches/month

## Next Steps (Optional Bonus)

1. **Redis Cache** - Replace in-memory with Redis for multi-server
2. **Pgvector** - Use native PostgreSQL vector extension
3. **Advanced Filters** - Category, price range, rating
4. **Query History** - Save popular questions
5. **Analytics** - Track search patterns
6. **Feedback Loop** - Let users rate answers

## Files Created

```
prisma/
  ├── schema.prisma (updated with embedding field)
  └── migrations/20251217162117_add_embedding_field/

tools/
  └── embed-businesses.ts (embedding generation script)

apps/yb-api/src/
  ├── services/
  │   └── ai-search.service.ts (RAG implementation)
  └── routes/
      └── ai-search.ts (API endpoint)

apps/adoptable/src/app/
  └── yellow-books/
      └── assistant/
          └── page.tsx (UI interface)

GEMINI_SETUP.md (API key guide)
AI_ASSISTANT_SETUP.md (this file)
```

## Success! 🎉

You now have a fully functional AI-powered intelligent search system!

Try it at: **http://localhost:3000/yellow-books/assistant**
