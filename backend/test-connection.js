/**
 * Test MongoDB Connection Script
 * Run this to diagnose connection issues
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  
  // Check if .env file exists
  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI not found in .env file');
    console.error('   Make sure backend/.env file exists with MONGODB_URI');
    process.exit(1);
  }

  // Mask password for display
  const maskedURI = process.env.MONGODB_URI.replace(
    /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
    'mongodb+srv://$1:****@'
  );
  
  console.log('📋 Connection Details:');
  console.log(`   URI: ${maskedURI}`);
  
  // Parse connection string to extract info
  const uri = process.env.MONGODB_URI;
  const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
  
  if (match) {
    const [, username, password, cluster, database] = match;
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password.length > 0 ? '**** (hidden)' : 'EMPTY!'}`);
    console.log(`   Cluster: ${cluster}`);
    console.log(`   Database: ${database}\n`);
  }

  console.log('🔄 Attempting connection...\n');

  try {
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ SUCCESS! MongoDB Connected!\n');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Ready State: ${conn.connection.readyState} (1 = connected)\n`);
    
    // Test a simple query
    try {
      const collections = await conn.connection.db.listCollections().toArray();
      console.log(`📦 Collections in database: ${collections.length}`);
      if (collections.length > 0) {
        console.log('   Collections:', collections.map(c => c.name).join(', '));
      } else {
        console.log('   (No collections yet - database is empty)');
      }
    } catch (err) {
      console.log('   (Could not list collections - may need permissions)');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ CONNECTION FAILED!\n');
    console.error(`Error Type: ${error.name}`);
    console.error(`Error Message: ${error.message}\n`);
    
    // Specific error handling
    if (error.message.includes('Authentication failed') || error.message.includes('bad auth')) {
      console.error('🔐 AUTHENTICATION ERROR DETECTED\n');
      console.error('Possible causes:');
      console.error('1. ❌ Wrong username or password');
      console.error('2. ❌ IP address not whitelisted in MongoDB Atlas');
      console.error('3. ❌ Database user doesn\'t have correct permissions\n');
      
      console.error('📝 Steps to fix:');
      console.error('1. Go to: https://cloud.mongodb.com/');
      console.error('2. Network Access → Add IP Address → 0.0.0.0/0 (for development)');
      console.error('3. Database Access → Verify user exists and password is correct');
      console.error('4. Wait 2 minutes after changes, then try again\n');
      
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🌐 DNS/NETWORK ERROR\n');
      console.error('Cannot resolve cluster hostname. Check:');
      console.error('1. Internet connection');
      console.error('2. Cluster hostname is correct');
      console.error('3. Firewall is not blocking connections\n');
      
    } else if (error.message.includes('timeout')) {
      console.error('⏱️  TIMEOUT ERROR\n');
      console.error('Connection timed out. Check:');
      console.error('1. IP address is whitelisted');
      console.error('2. Internet connection is stable');
      console.error('3. MongoDB Atlas cluster is running (not paused)\n');
    }
    
    console.error('💡 For more help, see: backend/TROUBLESHOOTING.md\n');
    process.exit(1);
  }
}

// Run the test
testConnection();

