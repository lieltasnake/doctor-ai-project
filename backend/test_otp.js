const http = require('http');

const API_URL = 'http://localhost:5000/api/auth';
let tempEmail = 'patient@example.com';
let receivedOtp = '';

const request = (path, method, body) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 5000,
            path: `/api/auth${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, data: JSON.parse(data) });
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

const runTests = async () => {
    console.log('Registering user...');
    await request('/register', 'POST', { full_name: 'Patient User', email: tempEmail, password: 'password123' });

    console.log('Testing unknown email...');
    let res = await request('/login', 'POST', { email: 'unknown@example.com' });
    if (res.status === 404) console.log('✅ Unknown email blocked.');
    else console.log('❌ Unknown email failed.');

    console.log('\nTesting existing email...');
    res = await request('/login', 'POST', { email: tempEmail });
    if (res.status === 200) console.log('✅ Existing email got OTP.');
    else console.log('❌ Existing email failed.');

    const { Client } = require('pg');
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'doctor_ai',
        password: '1234', // fix password
        port: 5432,
    });
    
    // Quick DB query
    try {
        await client.connect();
        const dbRes = await client.query('SELECT otp_code FROM otp_codes WHERE email = $1 ORDER BY created_at DESC LIMIT 1', [tempEmail]);
        receivedOtp = dbRes.rows[0].otp_code;
        console.log(`Grabbed OTP from DB: ${receivedOtp}`);
    } catch(e) {
        console.error('DB Error', e);
    } finally {
        await client.end();
    }

    console.log('\nTesting wrong OTP...');
    res = await request('/verify-otp', 'POST', { email: tempEmail, otp: '000000' });
    if (res.status === 401) console.log('✅ Wrong OTP blocked.');
    else console.log('❌ Wrong OTP failed.', res.data);

    console.log('\nTesting correct OTP...');
    res = await request('/verify-otp', 'POST', { email: tempEmail, otp: receivedOtp });
    if (res.status === 200 && res.data.token) console.log('✅ Correct OTP verified.');
    else console.log('❌ Correct OTP failed.', res.data);
};

runTests();
