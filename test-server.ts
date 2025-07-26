import express from 'express';

const app = express();
const PORT = 3001;

// Simple health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n--- TEST SERVER STARTED ---`);
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Try: curl http://localhost:3001/api/health');
  console.log('---\n');
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  console.error('\n--- SERVER ERROR ---');
  console.error('Error starting test server:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nStopping test server...');
  server.close(() => {
    console.log('Test server stopped.');
    process.exit(0);
  });
});
