#!/usr/bin/env node

/**
 * Quick setup script to verify environment and database connection
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setup() {
  console.log('🔧 Setting up TinyLink...\n');

  // Check environment variables
  console.log('📋 Checking environment variables...');
  const requiredVars = ['DATABASE_URL'];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('   Please create a .env file with the required variables.');
    console.error('   See ENV_SETUP.md for details.\n');
    process.exit(1);
  }

  console.log('✅ Environment variables configured\n');

  // Test database connection
  console.log('🔌 Testing database connection...');
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Try to query the database
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database is ready\n');

    console.log('🎉 Setup complete! You can now run:');
    console.log('   npm run dev     (for development)');
    console.log('   npm start       (for production)\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\nPlease check your DATABASE_URL in the .env file.');
    console.error('Make sure you have:');
    console.error('  1. Created a PostgreSQL database (Neon, Railway, etc.)');
    console.error('  2. Run: npm run prisma:generate');
    console.error('  3. Run: npm run prisma:migrate\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setup();

