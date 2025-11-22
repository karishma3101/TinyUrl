/**
 * Test script to verify Prisma database connection
 * Run with: node test-db.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function test() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test connection
    console.log('1️⃣ Connecting to database...');
    await prisma.$connect();
    console.log('   ✅ Connected successfully!\n');
    
    // Test query
    console.log('2️⃣ Querying database...');
    const count = await prisma.link.count();
    console.log(`   ✅ Query successful!\n`);
    
    // Show results
    console.log('3️⃣ Database Status:');
    console.log(`   📊 Total links in database: ${count}\n`);
    
    // List all links if any exist
    if (count > 0) {
      console.log('4️⃣ Existing links:');
      const links = await prisma.link.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      links.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.shortCode} -> ${link.targetUrl} (${link.totalClicks} clicks)`);
      });
      console.log();
    }
    
    // Disconnect
    console.log('5️⃣ Disconnecting...');
    await prisma.$disconnect();
    console.log('   ✅ Disconnected successfully!\n');
    
    console.log('🎉 All tests passed! Your database is ready to use.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error occurred:\n');
    console.error('   Error message:', error.message);
    console.error('\n   Common issues:');
    console.error('   - DATABASE_URL not set in .env file');
    console.error('   - Invalid connection string');
    console.error('   - Database server not accessible');
    console.error('   - Database/tables not created (run: npm run prisma:migrate)');
    console.error('\n   Full error details:');
    console.error(error);
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

test();

