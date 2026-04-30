const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Get logged in user's profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await db.query('SELECT id, full_name, email, role, profile_image, language, created_at, updated_at FROM users WHERE id = $1', [req.user.id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error', details: err.message });
  }
});

// Update profile info (Manage Account)
router.put('/update', auth, async (req, res) => {
  const { full_name, email, password } = req.body;
  try {
    let query = 'UPDATE users SET full_name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, full_name, email, role, profile_image, language';
    let values = [full_name, email, req.user.id];

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      query = 'UPDATE users SET full_name = $1, email = $2, password = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, full_name, email, role, profile_image, language';
      values = [full_name, email, passwordHash, req.user.id];
    }

    const updatedUser = await db.query(query, values);
    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error', details: err.message });
  }
});

// Update profile photo
router.post('/upload-image', auth, async (req, res) => {
  const { profile_image } = req.body;
  try {
    const updatedUser = await db.query(
      'UPDATE users SET profile_image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, profile_image',
      [profile_image, req.user.id]
    );
    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error', details: err.message });
  }
});

// Update language
router.put('/language', auth, async (req, res) => {
  const { language } = req.body;
  try {
    const updatedUser = await db.query(
      'UPDATE users SET language = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, language',
      [language, req.user.id]
    );
    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error', details: err.message });
  }
});

module.exports = router;
