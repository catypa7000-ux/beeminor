/**
 * Backend Status Checker
 * Run this to diagnose backend connectivity issues
 */

const http = require('http');

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001';

console.log('🔍 Checking backend status...\n');
console.log(`📍 API Base URL: ${API_BASE_URL}\n`);

function checkEndpoint(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          success: true,
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout (5 seconds)'
      });
    });

    req.end();
  });
}

async function main() {
  // Check main endpoint
  console.log('1️⃣ Checking main API endpoint...');
  const mainCheck = await checkEndpoint(`${API_BASE_URL}/`);
  
  if (mainCheck.success) {
    console.log(`✅ Backend is running! Status: ${mainCheck.status}`);
    console.log(`   Response: ${mainCheck.data}\n`);
  } else {
    console.log(`❌ Backend is NOT running`);
    console.log(`   Error: ${mainCheck.error}\n`);
    
    console.log('📝 Troubleshooting steps:\n');
    console.log('   1. Start the backend server:');
    console.log('      npm run backend:dev\n');
    console.log('   2. Make sure backend dependencies are installed:');
    console.log('      npm run backend:install\n');
    console.log('   3. Check if backend/.env file exists with MongoDB connection\n');
    console.log('   4. Verify no other process is using port 3001\n');
    
    return;
  }

  // Check API health
  console.log('2️⃣ Checking /api endpoint...');
  const apiCheck = await checkEndpoint(`${API_BASE_URL}/api`);
  
  if (apiCheck.success) {
    console.log(`✅ API is responding! Status: ${apiCheck.status}`);
    console.log(`   Response: ${apiCheck.data}\n`);
  } else {
    console.log(`❌ API endpoint failed`);
    console.log(`   Error: ${apiCheck.error}\n`);
  }

  console.log('✨ Backend check complete!\n');
}

main().catch(console.error);
