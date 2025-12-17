import express from 'express';
import * as path from 'path';
import yellowBooksRouter from './routes/yellow-books';
import createYellowBookRouter from './routes/create-yellow-book';
import aiSearchRouter from './routes/ai-search';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import { initializeJobQueue, stopJobQueue } from './services/job-queue.service';

const app = express();

app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Apply CORS middleware
app.use(corsMiddleware);

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to yb-api!' });
});

// Mount yellow-books routes
app.use('/api/yellow-books', yellowBooksRouter);
app.use('/api/yellow-books', createYellowBookRouter);

// Mount AI search routes
app.use('/api/ai/yellow-books', aiSearchRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

const port = process.env.PORT || 3333;

// Initialize job queue before starting server
initializeJobQueue()
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Listening at http://localhost:${port}/api`);
    });
    
    server.on('error', console.error);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      await stopJobQueue();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    console.error('Failed to initialize job queue:', error);
    process.exit(1);
  });