/**
 * AI Search Route for Yellow Book
 * 
 * POST /api/ai/yellow-books/search
 * 
 * Request body:
 * {
 *   "question": "Where can I find good Italian restaurants?",
 *   "city": "New York" (optional)
 * }
 * 
 * Response:
 * {
 *   "answer": "AI-generated answer...",
 *   "businesses": [...],
 *   "cached": false
 * }
 */

import { Router, Request, Response } from 'express';
import { searchBusinessesWithAI } from '../services/ai-search.service';

const router = Router();

interface SearchRequest {
  question: string;
  city?: string;
}

router.post('/search', async (req: Request, res: Response) => {
  try {
    const { question, city } = req.body as SearchRequest;
    
    // Validation
    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Question is required and must be a string',
      });
    }
    
    if (question.trim().length < 3) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Question must be at least 3 characters long',
      });
    }
    
    // Perform AI search
    console.log(`🤖 AI Search: "${question}" ${city ? `in ${city}` : ''}`);
    
    const result = await searchBusinessesWithAI(question, city);
    
    return res.json(result);
    
  } catch (error) {
    console.error('❌ AI Search error:', error);
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process AI search',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
