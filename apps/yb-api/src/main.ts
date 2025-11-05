import express from 'express';
import * as path from 'path';
import yellowBooksRouter from './routes/yellow-books';
import createYellowBookRouter from './routes/create-yellow-book';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';

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

// Error handling middleware (must be last)
app.use(errorHandler);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);