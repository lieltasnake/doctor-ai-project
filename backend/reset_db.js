const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function resetDb() {
  const appClient = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'doctor_ai',
    password: process.env.DB_PASSWORD || '1234',
    port: process.env.DB_PORT || 5432,
  });

  try {
    await appClient.connect();
    console.log(`Connected to doctor_ai. Dropping public schema...`);
    await appClient.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    
    console.log('Running initialization scripts...');
    const sqlFile = path.join(__dirname, 'db/init.sql');
    const sqlConfig = fs.readFileSync(sqlFile, 'utf8');
    await appClient.query(sqlConfig);
    console.log('✅ DB reset successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await appClient.end();
  }
}

resetDb();
