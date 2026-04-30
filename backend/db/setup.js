const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
  // 1. Connect to default 'postgres' database to create the application database
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres', // Connect to default
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  });

  try {
    await client.connect();
    
    // Check if database exists
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${process.env.DB_NAME}'`);
    if (res.rowCount === 0) {
      console.log(`Creating database ${process.env.DB_NAME}...`);
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log('Database created successfully.');
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists.`);
    }
  } catch (err) {
    console.error('❌ Error connecting to PostgreSQL. Are you sure it is running on your computer?');
    console.error('Make sure the DB_PASSWORD in backend/.env matches your PostgreSQL app password!');
    console.error(err.message);
    process.exit(1);
  } finally {
    await client.end();
  }

  // 2. Connect to the actual application database and run the schema script
  const appClient = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  });

  try {
    await appClient.connect();
    console.log(`Connected to ${process.env.DB_NAME} database. Running initialization scripts...`);
    
    const sqlFile = path.join(__dirname, 'init.sql');
    const sqlConfig = fs.readFileSync(sqlFile, 'utf8');
    
    await appClient.query(sqlConfig);
    console.log('✅ All tables (users, symptoms, chat_history, etc.) created successfully!');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    await appClient.end();
  }
}

setupDatabase();
