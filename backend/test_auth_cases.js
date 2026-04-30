async function testAuthCases() {
  const API_URL = 'http://192.168.43.252:5000/api/auth';
  
  // 1. Try to register a duplicate email
  console.log('--- Registering new user ---');
  await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Auth Test', email: 'duplicate@test.com', password: 'password123' })
  });
  
  console.log('--- Registering DUPLICATE user ---');
  let res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Auth Test 2', email: 'duplicate@test.com', password: 'password123' })
  });
  let data = await res.json();
  console.log('Duplicate Register Result:', data.message);

  // 2. Login with unknown email
  console.log('--- Login with UNKNOWN email ---');
  res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'unknown_never_registered@test.com', password: 'password123' })
  });
  data = await res.json();
  console.log('Unknown Email Login Result:', data.message);

  // 3. Login with wrong password
  console.log('--- Login with WRONG password ---');
  res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'duplicate@test.com', password: 'wrongpassword' })
  });
  data = await res.json();
  console.log('Wrong Password Login Result:', data.message);

  // 4. Successful login
  console.log('--- Successful Login ---');
  res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'duplicate@test.com', password: 'password123' })
  });
  data = await res.json();
  console.log('Successful Login Result:', data.token ? 'Token Received' : 'Failed');
}

testAuthCases();
