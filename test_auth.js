const API_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
  console.log('--- Testing Patient ---');
  // 1. Register Patient
  let res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Patient', email: 'patient@example.com', password: 'password123', role: 'patient' })
  });
  let data = await res.json();
  console.log('Register Patient:', data);

  // 2. Login Patient
  res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'patient@example.com', password: 'password123' })
  });
  data = await res.json();
  console.log('Login Patient (Role returned):', data.role);

  console.log('\n--- Testing Admin ---');
  // 3. Register Admin
  res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Admin', email: 'admin@example.com', password: 'adminpassword', role: 'admin' })
  });
  data = await res.json();
  console.log('Register Admin:', data);

  // 4. Login Admin
  res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'adminpassword' })
  });
  data = await res.json();
  console.log('Login Admin (Role returned):', data.role);
}

testAuth();
