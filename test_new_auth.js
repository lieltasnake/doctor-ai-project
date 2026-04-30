const { Client } = require('pg');

async function testAuth() {
  const API_URL = 'http://10.139.58.61:5000/api/auth';
  
  console.log('--- Testing Patient Registration (Default Role) ---');
  let res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Test Patient', email: 'patient@example.com', password: 'password123' })
  });
  let data = await res.json();
  console.log('Register Response:', data);

  console.log('\n--- Testing Patient Login ---');
  res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'patient@example.com', password: 'password123' })
  });
  data = await res.json();
  console.log('Login Patient (Role returned):', data.role);

  console.log('\n--- Testing Admin (Manual DB Update) ---');
  res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Test Admin', email: 'admin@example.com', password: 'adminpassword' })
  });
  data = await res.json();
  console.log('Register Admin (Defaults to patient):', data.role);

  // Manually update role in DB
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'doctor_ai',
    password: '1234',
    port: 5432,
  });
  await client.connect();
  await client.query("UPDATE users SET role='admin' WHERE email='admin@example.com'");
  await client.end();
  console.log('Manually updated admin role in DB.');

  console.log('\n--- Testing Admin Login ---');
  res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'adminpassword' })
  });
  data = await res.json();
  console.log('Login Admin (Role returned):', data.role);
}

testAuth();
