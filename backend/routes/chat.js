const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming db is set up

router.post('/message', async (req, res) => {
  const { message } = req.body;
  
  if (!message) return res.status(400).json({ error: "Message is required" });

  const msg = message.toLowerCase();
  
  // Simple logic based on keywords for immediate testing
  let riskLevel = "Low";
  let reply = "I understand you are experiencing some discomfort. Please tell me more.";
  
  if (msg.includes("pain") || msg.includes("headache")) {
      riskLevel = "Medium";
      reply = "I noted that you are experiencing pain. How severe is it on a scale of 1 to 10?";
  }
  
  if (msg.includes("bleeding") || msg.includes("chest")) {
      riskLevel = "High";
      reply = "You mentioned a potentially serious symptom. I recommend seeking immediate medical attention.";
  }

  // Attempt to save to chat_history table (if database is connected)
  try {
    // Assuming user_id 1 for local testing without JWT middleware yet
    await db.query(
      'INSERT INTO chat_history (user_id, message_type, message_content, sender) VALUES ($1, $2, $3, $4)',
      [1, 'text', message, 'user']
    );
    await db.query(
      'INSERT INTO chat_history (user_id, message_type, message_content, sender) VALUES ($1, $2, $3, $4)',
      [1, 'text', reply, 'ai']
    );
  } catch(e) {
    console.error("Note: Could not save to chat history (DB might not be connected yet)", e.message);
  }

  res.json({ reply, riskLevel });
});

module.exports = router;
