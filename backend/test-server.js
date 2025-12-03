const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Test server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API endpoint is working'
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📍 Test: http://localhost:${PORT}/`);
  console.log(`📍 API Test: http://localhost:${PORT}/api`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});