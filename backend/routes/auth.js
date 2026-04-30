const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || 'mygmail@gmail.com',
        pass: process.env.EMAIL_PASS || 'my_gmail_app_password'
    }
});

// Register a new user
router.post('/register', async (req, res) => {
  const { full_name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Force role to patient
    const userRole = 'patient';

    // Insert user
    const newUser = await db.query(
      'INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role',
      [full_name, email, passwordHash, userRole]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', details: err.message });
  }
});

const generateAndSendOTP = async (email) => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes

    // Invalidate old OTPs
    await db.query('UPDATE otp_codes SET used = true WHERE email = $1 AND used = false', [email]);

    // Save new OTP
    await db.query(
      'INSERT INTO otp_codes (email, otp_code, expires_at) VALUES ($1, $2, $3)',
      [email, otpCode, expiresAt]
    );

    console.log(`[DEV] Generated Email OTP for ${email}: ${otpCode}`);

    try {
        await transporter.sendMail({
            from: `"Doctor AI" <${process.env.EMAIL_USER || 'noreply@doctorai.com'}>`,
            to: email,
            subject: "Doctor AI Verification Code",
            text: `Your verification code is: ${otpCode}\nThis code expires in 5 minutes.`
        });
        console.log(`[DEV] Email sent to ${email} via Gmail.`);
    } catch (error) {
        console.error('Failed to send Gmail:', error.message);
        throw new Error('Failed to send email. Please check configuration.');
    }
    
    return otpCode;
};

// Login an existing user (Request OTP)
router.post('/login', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Email not registered' });
    }

    await generateAndSendOTP(email);
    res.json({ message: 'OTP sent successfully to email', email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server Error', details: err.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Check if OTP is valid
    const otpRecord = await db.query(
      'SELECT * FROM otp_codes WHERE email = $1 AND otp_code = $2 AND used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (otpRecord.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    // Mark OTP as used
    await db.query('UPDATE otp_codes SET used = true WHERE id = $1', [otpRecord.rows[0].id]);

    // Get user
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    // Generate token
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '7d' } // Extend to 7 days for auto-login demo
    );

    res.json({ token, role: user.rows[0].role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', details: err.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'Email not registered' });
        }
        await generateAndSendOTP(email);
        res.json({ message: 'OTP resent successfully', email });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message || 'Server Error', details: err.message });
    }
});

module.exports = router;
