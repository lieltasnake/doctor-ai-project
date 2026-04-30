async function testProfile() {
  const API_URL = 'http://192.168.43.252:5000/api';
  
  console.log('--- Registering ---');
  let res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Jane ProfileTest', email: 'jane@profile.com', password: 'password123' })
  });
  let data = await res.json();
  console.log('Register:', data.email);

  console.log('--- Logging In ---');
  res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'jane@profile.com', password: 'password123' })
  });
  data = await res.json();
  const token = data.token;
  console.log('Token received');

  console.log('--- Fetching Profile ---');
  res = await fetch(`${API_URL}/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  data = await res.json();
  console.log('Profile:', data.full_name, data.language);

  console.log('--- Updating Language ---');
  res = await fetch(`${API_URL}/profile/language`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ language: 'Amharic' })
  });
  data = await res.json();
  console.log('Updated Language:', data.language);
}

testProfile();
